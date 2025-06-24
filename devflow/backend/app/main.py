"""
FastAPI application for DevFlow backend.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, Body
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Optional, Any
from .services.code_parser import CodeParser
from .services.embedder import CodeEmbedder
from .db.vector_store import VectorStore
from .services.cache import CacheService
from .services.rate_limiter import rate_limiter
from .core.config import get_settings
import os
from pathlib import Path
import json
from datetime import datetime
import logging
import traceback
import numpy as np
from chromadb import PersistentClient
from app.services.code_indexer import CodeIndexer
from app.services.rag_engine import RAGEngine
from app.db import metadata_store
import uuid
from app.api.v1.endpoints import router as v1_router
from app.core.utils import get_workspace_root

app = FastAPI(
    title="DevFlow API",
    description="AI-Powered Code Analysis and Understanding API",
    version="0.0.1",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
code_parser = CodeParser()
code_embedder = CodeEmbedder()

# Use workspace-specific DB directory
workspace_root = get_workspace_root()
persist_directory = os.path.join(workspace_root, ".devflow", "chroma_db")
os.makedirs(persist_directory, exist_ok=True)
client = PersistentClient(path=persist_directory)
vector_store = VectorStore(client)

# Initialize code indexer
code_indexer = CodeIndexer(vector_store)

# Initialize RAG engine
rag_engine = RAGEngine(vector_store)

cache = CacheService()
settings = get_settings()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger("devflow")

# Language mapping for file extensions
LANGUAGE_MAP = {
    'py': 'python',
    'js': 'javascript',
    'ts': 'typescript',
    'java': 'java',
    'go': 'go',
    'rb': 'ruby',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'cs': 'csharp',
    'kt': 'kotlin',
    'php': 'php',
    'c': 'c',
    'rs': 'rust',
    'scala': 'scala',
    'swift': 'swift'
}

class IndexRequest(BaseModel):
    path: str
    recursive: bool = True
    extensions: Optional[List[str]] = None

class FindSimilarRequest(BaseModel):
    code_snippet: str
    language: str
    context: Optional[Dict[str, Any]] = None

class SearchRequest(BaseModel):
    query: str
    limit: int = 5

class ApiResponse(BaseModel):
    message: str
    data: dict | None = None

class CodeRequest(BaseModel):
    code: str
    language: str
    file_path: Optional[str] = None

class CodeResponse(BaseModel):
    elements: Dict[str, List[Dict]]
    chunks: List[Dict]

class SearchResponse(BaseModel):
    chunks: List[dict]
    
    model_config = ConfigDict(
        json_encoders={
            np.float32: lambda v: float(v)
        }
    )

# Root redirect
@app.get("/", response_class=RedirectResponse)
async def root():
    """Redirect to the API documentation."""
    return RedirectResponse(url="/docs")

# Include API router
app.include_router(v1_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 