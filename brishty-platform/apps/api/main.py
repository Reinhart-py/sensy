from fastapi import FastAPI, File, UploadFile, BackgroundTasks, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import io
import csv
import storage
import worker
import models
import uuid

app = FastAPI(
    title="Sensy Platform API",
    description="Multi-tenant API for OCR and document intelligence.",
    version="1.0.0"
)

# Pydantic Schemas
class DocumentCorrection(BaseModel):
    field_name: str
    old_value: str
    new_value: str

class DocumentApprovalRequest(BaseModel):
    user_id: str = "current_user_123"
    corrections: List[DocumentCorrection] = []

# Dependency
def get_db():
    db = models.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    models.init_db()

@app.get("/")
def read_root():
    return {"message": "Welcome to Sensy Platform API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # Initialize storage bucket if not exists
    storage.initialize_storage()
    
    # Generate unique filename to avoid collisions
    file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'pdf'
    unique_filename = f"{uuid.uuid4().hex}.{file_ext}"
    
    # Read and upload file to MinIO
    file_data = await file.read()
    storage.upload_file(file_data, unique_filename, file.content_type)
    
    # Trigger background Celery task
    task = worker.process_document.delay(unique_filename)
    
    return {
        "message": "File uploaded successfully",
        "file_name": unique_filename,
        "task_id": task.id
    }

@app.get("/documents")
def list_documents(db = Depends(get_db)):
    docs = db.query(models.Document).order_by(models.Document.created_at.desc()).limit(50).all()
    return [{"id": d.id, "filename": d.filename, "status": d.status, "classification": d.classification, "confidence_score": d.confidence_score} for d in docs]

@app.get("/documents/{document_id}")
def get_document(document_id: str, db = Depends(get_db)):
    doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    audit_trail = db.query(models.AuditEvent).filter(models.AuditEvent.document_id == document_id).all()
    return {
        "document": doc,
        "audit_trail": [{"action": a.action, "field": a.field_name, "old": a.old_value, "new": a.new_value, "user": a.user_id, "time": a.timestamp} for a in audit_trail]
    }

@app.post("/documents/{document_id}/approve")
def approve_document(document_id: str, request: DocumentApprovalRequest, db = Depends(get_db)):
    doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc.status == "approved":
        raise HTTPException(status_code=400, detail="Document is already approved")

    # Record corrections in audit log
    for corr in request.corrections:
        audit = models.AuditEvent(
            document_id=document_id,
            user_id=request.user_id,
            action="field_corrected",
            field_name=corr.field_name,
            old_value=corr.old_value,
            new_value=corr.new_value
        )
        db.add(audit)
        
        # In a real app, we would apply these corrections to doc.extracted_data
        
    # Mark as approved
    doc.status = "approved"
    
    # Record approval event
    db.add(models.AuditEvent(
        document_id=document_id,
        user_id=request.user_id,
        action="approved"
    ))
    
    db.commit()
    return {"status": "success", "message": "Document approved and audit trail recorded."}

@app.get("/export/csv")
def export_documents_csv(db = Depends(get_db)):
    docs = db.query(models.Document).filter(models.Document.status == "approved").all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Filename", "Classification", "Confidence", "Exported At"])
    
    for d in docs:
        writer.writerow([d.id, d.filename, d.classification, d.confidence_score, d.updated_at.isoformat()])
        
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sensy_export.csv"}
    )

