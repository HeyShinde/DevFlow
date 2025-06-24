# API Reference

The DevFlow backend provides a RESTful API for code indexing, search, and AI-powered features.

---

## Base URL

```
http://localhost:8000/api
```

---

## Authentication

Currently, the API does not require authentication. In production, consider adding API key authentication.

---

## Endpoints

### Health Check

**GET** `/health`

Check if the backend is running and healthy.

**Response:**
```json
{
  "success": true,
  "message": "Backend is healthy.",
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-01T12:00:00"
  }
}
```

---

### Index Codebase

**POST** `/index`

Index your codebase for search and embeddings.

**Request Body:**
```json
{
  "path": "./src",
  "recursive": true,
  "extensions": ["py", "js", "ts"]
}
```

**Parameters:**
- `path` (string): Path to the directory to index
- `recursive` (boolean): Include subdirectories (default: true)
- `extensions` (array): File extensions to include (optional)

**Response:**
```json
{
  "message": "Indexing completed successfully",
  "data": {
    "files_processed": 50,
    "chunks_created": 150,
    "embeddings_generated": 150
  }
}
```

---

### Search Codebase

**POST** `/search`

Search your codebase using natural language or keywords.

**Request Body:**
```json
{
  "query": "authentication function",
  "limit": 5
}
```

**Parameters:**
- `query` (string): Search query
- `limit` (integer): Number of results (default: 5)

**Response:**
```json
{
  "chunks": [
    {
      "type": "function",
      "name": "authenticate_user",
      "file_path": "./src/auth.py",
      "code": "def authenticate_user(username, password):\n    ...",
      "language": "python",
      "score": 0.95
    }
  ]
}
```

---

### Find Similar Code

**POST** `/find_similar`

Find code snippets similar to the provided code.

**Request Body:**
```json
{
  "code_snippet": "def calculate_total(items):\n    return sum(item.price for item in items)",
  "language": "python"
}
```

**Parameters:**
- `code_snippet` (string): Code to find similar examples for
- `language` (string): Programming language
- `context` (object): Additional context (optional)

**Response:**
```json
{
  "chunks": [
    {
      "type": "function",
      "name": "calculate_sum",
      "file_path": "./src/utils.py",
      "code": "def calculate_sum(numbers):\n    return sum(numbers)",
      "language": "python",
      "score": 0.88
    }
  ]
}
```

---

### Get Statistics

**GET** `/stats?debug=false`

Get repository and indexing statistics.

**Parameters:**
- `debug` (boolean): Include debug information (default: false)

**Response:**
```json
{
  "file_count": 50,
  "chunk_count": 150,
  "vector_count": 150,
  "embedding_dimensions": 1536,
  "vector_languages": ["python", "javascript"],
  "vector_sample_files": ["src/main.py", "src/utils.py"]
}
```

---

### Clear Index

**POST** `/clear`

Clear all indexed data and embeddings.

**Response:**
```json
{
  "message": "Index cleared successfully"
}
```

---

### AI Answer

**POST** `/answer`

Get AI-powered answers to code questions.

**Request Body:**
```json
{
  "query": "How does authentication work in this codebase?",
  "limit": 5,
  "openai_key": "sk-...",
  "openai_model": "gpt-4.1-nano",
  "openai_token_limit": 2048
}
```

**Parameters:**
- `query` (string): Question about the codebase
- `limit` (integer): Number of context chunks (default: 5)
- `openai_key` (string): OpenAI API key (optional)
- `openai_model` (string): OpenAI model (optional)
- `openai_token_limit` (integer): Token limit (optional)

**Response:**
```json
{
  "answer": "The authentication system uses JWT tokens...",
  "context_chunks": [...]
}
```

---

### List Files

**GET** `/files`

Get a list of all indexed files.

**Response:**
```json
[
  {
    "id": 1,
    "path": "./src/main.py",
    "created_at": "2025-01-01T12:00:00"
  }
]
```

---

### List Chunks

**GET** `/chunks?file_id=1`

Get chunks for a specific file.

**Parameters:**
- `file_id` (integer): File ID

**Response:**
```json
[
  {
    "id": "uuid-1",
    "type": "function",
    "name": "main",
    "start_line": 1,
    "end_line": 10
  }
]
```

---

### Add Feedback

**POST** `/feedback`

Add feedback for a code chunk.

**Request Body:**
```json
{
  "chunk_id": "uuid-1",
  "feedback_type": "helpful",
  "comment": "This was very useful!"
}
```

**Parameters:**
- `chunk_id` (string): Chunk ID
- `feedback_type` (string): Type of feedback
- `comment` (string): Optional comment

---

### List Feedback

**GET** `/feedback?chunk_id=uuid-1`

Get feedback for a specific chunk.

**Parameters:**
- `chunk_id` (string): Chunk ID

**Response:**
```json
[
  {
    "id": 1,
    "chunk_id": "uuid-1",
    "feedback_type": "helpful",
    "comment": "This was very useful!",
    "created_at": "2025-01-01T12:00:00"
  }
]
```

---

## Error Responses

All endpoints may return the following error format:

```json
{
  "detail": "Error message"
}
```

Common HTTP status codes:
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting

The API includes rate limiting to prevent abuse. Limits are configurable in the environment variables.

---

## Interactive Documentation

Visit `http://localhost:8000/docs` for interactive API documentation powered by Swagger UI. 