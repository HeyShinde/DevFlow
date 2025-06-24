# Backend Overview

The DevFlow backend is a Python-based service that powers the AI-driven code search and understanding features. It handles code parsing, indexing, embeddings, and provides RESTful APIs for the VS Code extension.

---

## What the Backend Does

- **Code Parsing**: Analyzes source code files and extracts functions, classes, and documentation.
- **Vector Embeddings**: Generates semantic embeddings for code snippets using advanced language models.
- **Search & Retrieval**: Provides fast, semantic search across your entire codebase.
- **AI Integration**: Connects with OpenAI APIs for context-aware code explanations and answers.
- **Data Management**: Stores code metadata and embeddings in a vector database (ChromaDB).

---

## Architecture

The backend follows a modular architecture with clear separation of concerns:

```
backend/
├── app/
│   ├── api/           # REST API endpoints
│   ├── core/          # Configuration and utilities
│   ├── db/            # Database models and connections
│   └── services/      # Business logic services
├── data/              # Data storage
├── tests/             # Test suite
└── requirements.txt   # Python dependencies
```

---

## Key Components

### API Layer (`app/api/`)
- **endpoints.py**: Main REST API endpoints for search, indexing, and health checks.
- Handles HTTP requests and responses.
- Provides OpenAPI/Swagger documentation.

### Core (`app/core/`)
- **config.py**: Application configuration and environment variables.
- **utils.py**: Utility functions and helpers.

### Database (`app/db/`)
- **metadata_store.py**: Manages file metadata and indexing information.
- **vector_store.py**: Handles ChromaDB operations for embeddings.
- **chroma_db/**: Vector database for storing code embeddings.

### Services (`app/services/`)
- **code_parser.py**: Parses and analyzes source code files.
- **embedder.py**: Generates vector embeddings for code snippets.
- **rag_engine.py**: Retrieval-Augmented Generation for AI answers.
- **cache.py**: Caching layer for improved performance.
- **rate_limiter.py**: API rate limiting and throttling.

---

## Data Flow

1. **Indexing**: Code files are parsed, chunked, and embedded into vectors.
2. **Search**: User queries are embedded and matched against stored vectors.
3. **Retrieval**: Relevant code snippets are retrieved and ranked.
4. **AI Processing**: Context is sent to OpenAI for enhanced answers.

---

## Technology Stack

- **FastAPI**: Modern Python web framework for APIs.
- **ChromaDB**: Vector database for embeddings storage.
- **OpenAI**: AI language models for code understanding.
- **Pydantic**: Data validation and serialization.
- **Uvicorn**: ASGI server for production deployment.

The backend is designed to be lightweight, fast, and easily extensible for custom use cases. 