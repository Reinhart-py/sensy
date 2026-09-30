import os
import tempfile
from celery import Celery
from docling.document_converter import DocumentConverter
import storage
import models
import llm_extractor
from sqlalchemy.orm import Session

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "sensy_worker",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

# Initialize DocumentConverter once for the worker
converter = DocumentConverter()

@celery_app.task(name="process_document", bind=True)
def process_document(self, file_name: str):
    """
    Background task to process uploaded documents using Docling.
    """
    db: Session = models.SessionLocal()
    
    doc_id = file_name.split('.')[0]
    doc_record = models.Document(
        id=doc_id,
        filename=file_name,
        status="processing"
    )
    db.add(doc_record)
    db.commit()
    
    try:
        # Download from MinIO to a temporary file
        file_ext = file_name.split('.')[-1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_ext}") as temp_file:
            storage.s3_client.download_file(storage.BUCKET_NAME, file_name, temp_file.name)
            local_path = temp_file.name
            
        # Parse document with Docling
        result = converter.convert(local_path)
        extracted_text = result.document.export_to_markdown()
        
        # Pass markdown to LLM for structured extraction
        llm_results = llm_extractor.extract_fields_from_markdown(extracted_text, "invoice")
        
        # Update database with extraction results
        doc_record.status = "completed"
        doc_record.extracted_data = {
            "markdown": extracted_text, 
            "structured_fields": llm_results["fields"]
        }
        doc_record.classification = "invoice" 
        doc_record.confidence_score = 0.95
        db.commit()
        
        # Clean up local file
        os.remove(local_path)
        
        return {"status": "success", "file_name": file_name, "extracted_length": len(extracted_text)}
        
    except Exception as e:
        doc_record.status = "failed"
        db.commit()
        return {"status": "error", "error": str(e)}
    finally:
        db.close()
