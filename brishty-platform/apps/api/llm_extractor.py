import json
import os
from pydantic import BaseModel, Field
from typing import List, Optional
from openai import OpenAI

# Initialize the OpenAI client
# Ensure OPENAI_API_KEY is set in the environment variables
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "dummy-key-for-now"))

class ExtractedField(BaseModel):
    id: str = Field(description="The unique identifier/key for the field (e.g., 'invoice_number')")
    label: str = Field(description="The human-readable label for the field")
    value: str = Field(description="The extracted value from the document")
    confidence: float = Field(description="Estimated confidence score between 0.0 and 1.0")

class DocumentExtraction(BaseModel):
    fields: List[ExtractedField]

def extract_fields_from_markdown(markdown_text: str, document_type: str = "invoice") -> dict:
    """
    Takes the raw markdown extracted by Docling and passes it to an LLM
    to extract structured fields based on the document type schema.
    """
    print(f"Sending {len(markdown_text)} characters to LLM for {document_type} extraction...")
    
    # If no API key is provided, fallback to the mock for demonstration purposes
    if client.api_key == "dummy-key-for-now" or not client.api_key:
        print("No OpenAI API key found, using mock extraction data.")
        if document_type == "invoice":
            return {
                "fields": [
                    {"id": "invoice_number", "label": "Invoice Number", "value": "INV-2023-0891", "confidence": 0.98},
                    {"id": "vendor_name", "label": "Vendor Name", "value": "Acme Corp", "confidence": 0.95},
                    {"id": "date", "label": "Date", "value": "2023-10-15", "confidence": 0.99},
                    {"id": "total", "label": "Total Amount", "value": "$4,520.00", "confidence": 0.82},
                    {"id": "tax", "label": "Tax", "value": "$452.00", "confidence": 0.91}
                ]
            }
        return {"fields": []}
    
    prompt = f"Extract structured information from the following {document_type} document text:\n\n{markdown_text[:10000]}"
    
    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": f"You are an expert document data extractor. Extract the standard fields typically found in a {document_type}."},
                {"role": "user", "content": prompt}
            ],
            response_format=DocumentExtraction,
        )
        
        result = completion.choices[0].message.parsed
        return result.model_dump()
    except Exception as e:
        print(f"Error during LLM extraction: {e}")
        return {"fields": [], "error": str(e)}
