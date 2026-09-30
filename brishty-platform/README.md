# Sensy - Document Intelligence Platform

Multi-tenant DocumentOps platform for OCR, document classification, AI field extraction, visual validation, approvals, audit trails, RAG citations, and ERP-ready exports.

## Overview
Sensy is a multi-tenant document-intelligence platform that converts invoices and business documents into validated structured data. It combines OCR, layout-aware parsing, AI extraction, human-in-the-loop review, approvals, audit logs, cited document Q&A, and exports to business systems.

## Key Features
- **Document Ingestion and Intelligence**: Drag/drop uploads, bulk ZIP upload, email-to-inbox, API uploads, shared upload links, file-virus scan, automatic classification, and AI extraction schema per type.
- **Visual Review Screen**: Interactive PDF viewer with extracted fields and confidence score. Click on extracted fields to highlight exact locations on the original PDF. User corrections are tracked as audit events.
- **Workflow and Controls**: Configurable review thresholds, approval chains, immutable audit events, retention policies, legal holds, duplicate invoice detection, and role-based access.
- **Exports and Integrations**: CSV/XLSX export, Google Sheets export, ERPNext integration, Tally XML export, webhooks, and REST API.

## Built With
Sensy integrates several powerful open-source projects. See below for details on how they are utilized and modifications made:
- [Docling](https://github.com/docling-project/docling) (MIT License): Used for the ingestion pipeline, parsing varied document types (PDFs, DOCX, etc.) into structured content.
- [docTR](https://github.com/mindee/doctr) (Apache-2.0 License): Used as the OCR engine for scans and images, providing word positions and layout blocks.
- [Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) (GPL-3.0 License): Used for storing, indexing, tagging, searching, and archiving original documents.
- [RAGFlow](https://github.com/infiniflow/ragflow) (Apache-2.0 License): Document-based AI Q&A with grounded citations.
- [Open WebUI](https://github.com/open-webui/open-webui) (MIT License): Optional AI workspace UI/API for self-hosted LLM chat and RAG.

Modifications to upstream repositories are kept in separate forks:
- `jin/docling-fork`
- `jin/paperless-ngx-fork`
- `jin/ragflow-fork`
- `jin/Sensy-platform`

## Architecture & Deployment
The core platform is built with:
- **Frontend**: Next.js dashboard + TypeScript
- **Backend**: FastAPI backend API
- **Database**: PostgreSQL + pgvector
- **Async Workers**: Redis + Celery
- **File Storage**: MinIO / S3

See `docs/architecture.md` for the full design.

## Getting Started

### Prerequisites
- Docker and Docker Compose
- OpenAI API Key (for LLM extraction & RAG)

### Running Locally
1. Clone the repository.
2. Create a `.env` file in the root of the project with your OpenAI API key:
   ```bash
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
   ```
3. Build and start the services using Docker Compose:
   ```bash
   docker-compose up -d --build
   ```
4. Access the platform:
   - **Visual Review Dashboard (Next.js)**: `http://localhost:3000`
   - **Backend API (FastAPI)**: `http://localhost:8000/docs`
   - **MinIO Console**: `http://localhost:9001` (admin/password123)

### Demo Flow
1. Open the Visual Review Dashboard.
2. Explore the Data Fields tab to review extracted values and confidence scores.
3. Switch to the "Ask AI (RAG)" tab to query the document contents directly.
4. Use the FastAPI swagger docs at `http://localhost:8000/docs` to test file uploads and the CSV export endpoint.
