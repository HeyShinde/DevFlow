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
from contextlib import asynccontextmanager

# Configure logging to WARNING level for terminal
logging.basicConfig(level=logging.WARNING, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger("devflow")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.warning("🚀 FastAPI startup event triggered")
    try:
        workspace_root = get_workspace_root()
        logger.warning(f"📁 Workspace root: {workspace_root}")
        persist_directory = os.path.join(workspace_root, ".devflow", "chroma_db")
        logger.warning(f"💾 Persist directory: {persist_directory}")
        os.makedirs(persist_directory, exist_ok=True)
        logger.warning(f"✅ Successfully created/verified persist directory")
        client = PersistentClient(path=persist_directory)
        logger.warning(f"✅ ChromaDB client initialized successfully")
        logger.warning("🎉 All startup checks passed!")
    except Exception as e:
        logger.error(f"❌ Startup error: {str(e)}")
        logger.error(f"❌ Traceback: {traceback.format_exc()}")

    yield  # <-- Application runs here

    # Shutdown logic
    logger.warning("🛑 FastAPI shutdown event triggered")

app = FastAPI(
    title="DevFlow API",
    description="AI-Powered Code Analysis and Understanding API",
    version="0.0.1",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services with error handling
try:
    logger.info("🔧 Initializing services...")
    
    code_parser = CodeParser()
    logger.info("✅ CodeParser initialized")
    
    code_embedder = CodeEmbedder()
    logger.info("✅ CodeEmbedder initialized")

    # Use workspace-specific DB directory
    workspace_root = get_workspace_root()
    logger.info(f"📁 Using workspace root: {workspace_root}")
    
    persist_directory = os.path.join(workspace_root, ".devflow", "chroma_db")
    logger.info(f"💾 Using persist directory: {persist_directory}")
    
    os.makedirs(persist_directory, exist_ok=True)
    logger.info("✅ Persist directory created/verified")
    
    client = PersistentClient(path=persist_directory)
    logger.info("✅ ChromaDB client initialized")
    
    vector_store = VectorStore(client)
    logger.info("✅ VectorStore initialized")

    # Initialize code indexer
    code_indexer = CodeIndexer(vector_store)
    logger.info("✅ CodeIndexer initialized")

    # Initialize RAG engine
    rag_engine = RAGEngine(vector_store)
    logger.info("✅ RAGEngine initialized")

    cache = CacheService()
    logger.info("✅ CacheService initialized")
    
    settings = get_settings()
    logger.info("✅ Settings loaded")
    
    logger.info("🎉 All services initialized successfully!")
    
except Exception as e:
    logger.error(f"❌ Service initialization error: {str(e)}")
    logger.error(f"❌ Traceback: {traceback.format_exc()}")
    # Don't raise here during module import - let the app start and handle errors gracefully

# Language mapping for file extensions
LANGUAGE_MAP = {
    'py': 'python',
    'js': 'javascript',
    'java': 'java',
    'go': 'go',
    'rb': 'ruby',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'cs': 'csharp',
    'kt': 'kotlin',
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

# Add startup event handler for debugging
@app.get("/health")
async def health_check():
    """Health check endpoint with detailed status."""
    try:
        status = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "workspace_root": get_workspace_root(),
            "services": {
                "code_parser": "initialized" if 'code_parser' in globals() else "not_initialized",
                "code_embedder": "initialized" if 'code_embedder' in globals() else "not_initialized",
                "vector_store": "initialized" if 'vector_store' in globals() else "not_initialized",
                "code_indexer": "initialized" if 'code_indexer' in globals() else "not_initialized",
                "rag_engine": "initialized" if 'rag_engine' in globals() else "not_initialized",
                "cache": "initialized" if 'cache' in globals() else "not_initialized",
            }
        }
        logger.warning(f"🏥 Health check passed: {status['status']}")
        return status
    except Exception as e:
        logger.error(f"❌ Health check failed: {str(e)}")
        logger.error(f"❌ Traceback: {traceback.format_exc()}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

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