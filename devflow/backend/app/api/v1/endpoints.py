from fastapi import APIRouter, HTTPException, BackgroundTasks, Request, Body, Query
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, ConfigDict
import os
import logging
import traceback
import uuid
from datetime import datetime
import numpy as np
from app.services.code_parser import CodeParser
from app.services.embedder import CodeEmbedder
from app.db.vector_store import VectorStore
from app.services.cache import CacheService
from app.services.rate_limiter import rate_limiter
from app.core.config import get_settings
from chromadb import PersistentClient
from app.services.code_indexer import CodeIndexer
from app.services.rag_engine import RAGEngine
from app.db import metadata_store
from app.core.utils import get_workspace_root
from app.db.metadata_store import delete_chunks_for_file
import openai

router = APIRouter()

# Initialize services and dependencies (should be shared with main.py)
code_parser = CodeParser()
code_embedder = CodeEmbedder()
workspace_root = get_workspace_root()
persist_directory = os.path.join(workspace_root, ".devflow", "chroma_db")
os.makedirs(persist_directory, exist_ok=True)
client = PersistentClient(path=persist_directory)
vector_store = VectorStore(client)
code_indexer = CodeIndexer(vector_store)
rag_engine = RAGEngine(vector_store)
cache = CacheService()
settings = get_settings()
logger = logging.getLogger("devflow")

LANGUAGE_MAP = {
    'py': 'python', 'js': 'javascript', 'ts': 'typescript', 'java': 'java', 'go': 'go', 'rb': 'ruby',
    'cpp': 'cpp', 'cc': 'cpp', 'cxx': 'cpp', 'cs': 'csharp', 'kt': 'kotlin', 'php': 'php', 'c': 'c',
    'rs': 'rust', 'scala': 'scala', 'swift': 'swift'
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
    model_config = ConfigDict(json_encoders={np.float32: lambda v: float(v)})

def get_workspace_root():
    # 1. Try environment variable
    root = os.environ.get("WORKSPACE_ROOT")
    if root and os.path.isdir(root):
        return os.path.abspath(root)
    # 2. Fallback: parent of backend/app/
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../"))

@router.get("/health")
async def health_check():
    return {
        "success": True,
        "message": "Backend is healthy.",
        "data": {
            "status": "healthy",
            "timestamp": datetime.now().isoformat()
        }
    }

@router.post("/index")
async def index_codebase(request: IndexRequest, background_tasks: BackgroundTasks, req: Request):
    await rate_limiter.check_rate_limit(
        req, "index", settings.RATE_LIMIT_REQUESTS, settings.RATE_LIMIT_WINDOW
    )
    try:
        # Clear the vector store before indexing
        vector_store.clear()
        logger.info(f"Starting indexing for path: {request.path}")
        # If the path is not absolute, resolve it relative to the project root
        if not os.path.isabs(request.path):
            path = os.path.abspath(os.path.join(workspace_root, request.path))
        else:
            path = request.path
        logger.info(f"Absolute path: {path}")
        if not os.path.exists(path):
            logger.error(f"Path not found: {path}")
            raise HTTPException(status_code=404, detail=f"Path not found: {path}")
        logger.info(f"Requested extensions: {request.extensions}")
        total_files = 0
        total_chunks = 0
        total_embeddings = 0
        for root, _, files in os.walk(path):
            logger.info(f"Scanning directory: {root}")
            if not request.recursive and root != path:
                logger.info(f"Skipping subdirectory (recursive=False): {root}")
                continue
            for file in files:
                file_ext = os.path.splitext(file)[1].lower()
                logger.info(f"Checking file: {file} with extension {file_ext}")
                if request.extensions:
                    normalized_exts = [ext.lower().lstrip('.') for ext in request.extensions]
                    logger.info(f"Normalized requested extensions: {normalized_exts}")
                    if file_ext.lstrip('.') not in normalized_exts:
                        logger.info(f"Skipping file {file} - extension {file_ext} not in {normalized_exts}")
                        continue
                file_path = os.path.join(root, file)
                try:
                    logger.info(f"Processing file: {file_path}")
                    with open(file_path, 'r', encoding='utf-8') as f:
                        code = f.read()
                    logger.info(f"Read {len(code)} bytes from {file_path}")
                    ext = os.path.splitext(file)[1][1:].lower()
                    lang = LANGUAGE_MAP.get(ext, ext)
                    logger.info(f"Detected language: {lang} (from extension: {ext})")
                    parsed_code = code_parser.parse_code(code, lang)
                    if not parsed_code:
                        logger.warning(f"Could not parse code for file: {file_path}")
                        continue
                    logger.info("Extracting functions and classes...")
                    functions = code_parser.extract_functions(parsed_code, code)
                    classes = code_parser.extract_classes(parsed_code, code)
                    logger.info(f"Extracted {len(functions)} functions and {len(classes)} classes from {file_path}")
                    file_record = metadata_store.add_file(file_path)
                    file_id = file_record.id
                    # Delete old chunks for this file before adding new ones
                    delete_chunks_for_file(file_id)
                    for func in functions:
                        try:
                            logger.info(f"Processing function: {func['name']}")
                            vector_store.add_vectors(
                                [func['code']],
                                [{
                                    'type': 'function',
                                    'name': func['name'],
                                    'file_path': file_path,
                                    'code': func['code'],
                                    'language': lang
                                }]
                            )
                            total_embeddings += 1
                            logger.info(f"Successfully embedded function: {func['name']}")
                            chunk_id = str(uuid.uuid4())
                            embedding_id = chunk_id
                            metadata_store.add_chunk(
                                file_id=file_id,
                                chunk_id=chunk_id,
                                type_='function',
                                name=func['name'],
                                start=func.get('start_line', 0),
                                end=func.get('end_line', 0),
                                embedding_id=embedding_id
                            )
                        except Exception as e:
                            logger.error(f"Embedding error for function in {file_path}: {e}\n{traceback.format_exc()}")
                    for cls in classes:
                        try:
                            logger.info(f"Processing class: {cls['name']}")
                            vector_store.add_vectors(
                                [cls['code']],
                                [{
                                    'type': 'class',
                                    'name': cls['name'],
                                    'file_path': file_path,
                                    'code': cls['code'],
                                    'language': lang
                                }]
                            )
                            total_embeddings += 1
                            logger.info(f"Successfully embedded class: {cls['name']}")
                            chunk_id = str(uuid.uuid4())
                            embedding_id = chunk_id
                            metadata_store.add_chunk(
                                file_id=file_id,
                                chunk_id=chunk_id,
                                type_='class',
                                name=cls['name'],
                                start=cls.get('start_line', 0),
                                end=cls.get('end_line', 0),
                                embedding_id=embedding_id
                            )
                        except Exception as e:
                            logger.error(f"Embedding error for class in {file_path}: {e}\n{traceback.format_exc()}")
                    total_files += 1
                    total_chunks += len(functions) + len(classes)
                except Exception as e:
                    logger.error(f"Error processing {file_path}: {e}\n{traceback.format_exc()}")
                    continue
        logger.info(f"Indexing complete: {total_files} files, {total_chunks} chunks, {total_embeddings} embeddings.")
        return {
            "success": True,
            "message": f"Indexing complete! {total_files} files, {total_chunks} code chunks, {total_embeddings} embeddings.",
            "data": {
                "total_files": total_files,
                "total_chunks": total_chunks,
                "total_embeddings": total_embeddings
            }
        }
    except Exception as e:
        logger.error(f"Fatal error in /api/index: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}\n{traceback.format_exc()}")

@router.post("/find_similar")
async def find_similar_code(request: FindSimilarRequest, req: Request):
    await rate_limiter.check_rate_limit(
        req, "find_similar", settings.RATE_LIMIT_REQUESTS, settings.RATE_LIMIT_WINDOW
    )
    try:
        logger.info(f"Finding similar code snippet in {request.language}")
        code_embedding = code_embedder.embed_code(request.code_snippet)
        results, scores = vector_store.search(code_embedding, k=3)
        logger.info(f"Found {len(results)} similar code chunks for context")
        chunks = []
        for result, score in zip(results, scores):
            logger.info(f"Processing result: {result} with score: {score}")
            chunk = {
                'text': str(result.get('code', '')),
                'file_path': str(result.get('file_path', '')),
                'type': str(result.get('type', '')),
                'name': str(result.get('name', '')),
                'score': float(score),
                'start_line': 0,
                'end_line': 0
            }
            logger.info(f"Created chunk: {chunk}")
            chunks.append(chunk)
        chunks.insert(0, {
            'text': request.code_snippet,
            'file_path': 'input',
            'type': 'snippet',
            'name': 'Original Code',
            'score': 1.0,
            'start_line': 0,
            'end_line': 0
        })
        logger.info(f"Similar code search generated with {len(chunks)} chunks")
        return {
            "success": True,
            "message": f"Similar code search generated for the provided code snippet. {len(chunks)} similar code chunks found.",
            "data": {
                "chunks": chunks
            }
        }
    except Exception as e:
        error_msg = f"Error during similar code search: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@router.post("/search")
async def search_codebase(request: SearchRequest, req: Request):
    try:
        logger.info(f"Received search: {request.query} (limit {request.limit})")
        results, distances = vector_store.search(request.query, k=request.limit)
        logger.info(f"Found {len(results)} results with scores: {distances}")
        chunks = []
        for result, score in zip(results, distances):
            logger.info(f"Processing result: {result} with score: {score}")
            chunk = {
                'text': result['code'],
                'file_path': result['file_path'],
                'type': result['type'],
                'name': result['name'],
                'score': float(score),
                'start_line': result.get('start_line', 0),
                'end_line': result.get('end_line', 0),
                'docstring': result.get('docstring'),
                'parent_class': result.get('parent_class'),
                'comments': result.get('comments', [])
            }
            logger.info(f"Created chunk: {chunk}")
            chunks.append(chunk)
        logger.info(f"Returning {len(chunks)} chunks")
        return {
            "success": True,
            "message": f"Search complete. {len(chunks)} relevant code chunks found.",
            "data": {
                "chunks": chunks
            }
        }
    except Exception as e:
        logger.error(f"Error searching codebase: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_stats(debug: bool = Query(False)):
    # Get vector/embedding stats from ChromaDB
    vector_stats = vector_store.get_stats(debug=debug)
    # Get file/chunk stats from metadata
    files = metadata_store.list_files() if hasattr(metadata_store, 'list_files') else []
    file_count = len(files)
    chunk_count = 0
    if hasattr(metadata_store, 'list_chunks'):
        for f in files:
            chunks = metadata_store.list_chunks(f['id'])
            chunk_count += len(chunks)
    stats = {
        "file_count": file_count,
        "chunk_count": chunk_count,
        "vector_count": vector_stats.get("total_vectors", 0),
        "embedding_dimensions": vector_stats.get("dimensions", 0),
        "vector_languages": vector_stats.get("languages", []),
        "vector_sample_files": vector_stats.get("sample_files", []),
        "last_indexed": vector_stats.get("last_indexed"),
        "errors": vector_stats.get("errors", []),
        "vector_debug": vector_stats.get("debug_info", {})
    }
    return {
        "success": True,
        "message": "Repository statistics retrieved.",
        "data": stats
    }

@router.get("/embeddings")
async def list_embeddings():
    embeddings = vector_store.list_all()
    return {
        "success": True,
        "message": f"{len(embeddings)} embeddings found.",
        "data": {
            "embeddings": embeddings
        }
    }

@router.post("/clear")
async def clear_index():
    try:
        vector_store.clear()
        cache.clear()
        metadata_store.clear()
        return {
            "success": True,
            "message": "Index cleared successfully.",
            "data": None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/answer")
async def answer_query(
    request: SearchRequest, req: Request,
    openai_key: Optional[str] = Body(None),
    openai_model: Optional[str] = Body(None),
    openai_token_limit: Optional[int] = Body(None)
):
    key = openai_key or settings.OPENAI_API_KEY
    model = openai_model or settings.OPENAI_MODEL
    token_limit = openai_token_limit or 2048

    logger.info(f"/answer called with key={'***' if key else None}, model={model}, token_limit={token_limit}")

    if not key:
        logger.warning("No OpenAI API key provided to /answer endpoint.")
        return {
            "success": False,
            "message": "No OpenAI API key provided. Please update it in the DevFlow UI (AI Settings tab).",
            "data": {"answer": None}
        }

    try:
        answer = rag_engine.answer_query(
            request.query,
            k=request.limit,
            openai_key=key,
            openai_model=model,
            openai_token_limit=token_limit
        )
        return {
            "success": True,
            "message": "AI-generated answer retrieved.",
            "data": {"answer": answer}
        }
    except Exception as e:
        logger.error(f"OpenAI API error in /answer: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"OpenAI API error: {e}",
            "data": {"answer": None}
        }

@router.get("/files")
def api_list_files():
    files = metadata_store.list_files()
    return {
        "success": True,
        "message": f"{len(files)} files found.",
        "data": {
            "files": files
        }
    }

@router.get("/chunks")
def api_list_chunks(file_id: int):
    chunks = metadata_store.list_chunks(file_id)
    return {
        "success": True,
        "message": f"{len(chunks)} chunks found for file {file_id}.",
        "data": {
            "chunks": chunks
        }
    }

@router.post("/feedback")
def api_add_feedback(chunk_id: str = Body(...), feedback_type: str = Body(...), comment: str = Body(None)):
    fb = metadata_store.add_feedback(chunk_id, feedback_type, comment)
    return {
        "success": True,
        "message": "Feedback added successfully.",
        "data": {
            "feedback": {
                "id": fb.id,
                "chunk_id": fb.chunk_id,
                "feedback_type": fb.feedback_type,
                "comment": fb.comment,
                "created_at": fb.created_at.isoformat() if fb.created_at else None
            }
        }
    }

@router.get("/feedback")
def api_list_feedback(chunk_id: str):
    feedbacks = metadata_store.list_feedback(chunk_id)
    return {
        "success": True,
        "message": f"{len(feedbacks)} feedback entries found for chunk {chunk_id}.",
        "data": {
            "feedback": feedbacks
        }
    }
