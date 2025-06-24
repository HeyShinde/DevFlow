# API Reference

Complete reference for the DevFlow backend API endpoints.

---

## Base URL

```
http://localhost:8000/api
```

---

## Authentication

Currently, the API runs locally without authentication. For production use, consider implementing API key authentication.

---

## Common Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": {}
}
```

---

## Health & Status

### Health Check

**Endpoint:** `GET /health`

**Description:** Check if the backend is running and healthy.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-15T10:30:00Z",
    "version": "0.0.1"
  }
}
```

**Example:**
```bash
curl http://localhost:8000/api/health
```

### Statistics

**Endpoint:** `GET /stats`

**Description:** Get backend statistics and index information.

**Query Parameters:**
- `debug` (optional): Include debug information

**Response:**
```json
{
  "success": true,
  "data": {
    "indexed_files": 1250,
    "total_chunks": 5678,
    "vector_dimensions": 1536,
    "database_size": "45.2 MB",
    "last_indexed": "2025-01-15T10:30:00Z",
    "supported_languages": ["python", "javascript", "typescript"],
    "debug": {
      "memory_usage": "234 MB",
      "uptime": "2h 15m",
      "cache_hits": 156,
      "cache_misses": 23
    }
  }
}
```

**Example:**
```bash
curl "http://localhost:8000/api/stats?debug=true"
```

---

## Indexing

### Index Repository

**Endpoint:** `POST /index`

**Description:** Index files in a directory for search.

**Request Body:**
```json
{
  "path": "./src",
  "recursive": true,
  "extensions": ["py", "js", "ts"],
  "max_file_size": 1048576,
  "exclude_patterns": ["test_*", "*.test.*"]
}
```

**Parameters:**
- `path` (string, required): Directory path to index
- `recursive` (boolean, optional): Index subdirectories (default: true)
- `extensions` (array, optional): File extensions to include
- `max_file_size` (integer, optional): Maximum file size in bytes
- `exclude_patterns` (array, optional): Patterns to exclude

**Response:**
```json
{
  "success": true,
  "data": {
    "indexed_files": 1250,
    "total_chunks": 5678,
    "processing_time": "45.2s",
    "errors": []
  },
  "message": "Indexing completed successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/index \
  -H "Content-Type: application/json" \
  -d '{
    "path": "./src",
    "recursive": true,
    "extensions": ["py", "js", "ts"]
  }'
```

### Clear Index

**Endpoint:** `POST /clear`

**Description:** Clear all indexed data.

**Response:**
```json
{
  "success": true,
  "data": {
    "cleared_files": 1250,
    "cleared_chunks": 5678
  },
  "message": "Index cleared successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/clear
```

---

## Search

### Semantic Search

**Endpoint:** `POST /search`

**Description:** Search for code using semantic similarity.

**Request Body:**
```json
{
  "query": "authentication function",
  "limit": 10,
  "language": "python",
  "file_extensions": ["py"],
  "min_similarity": 0.7
}
```

**Parameters:**
- `query` (string, required): Search query
- `limit` (integer, optional): Maximum results (default: 10)
- `language` (string, optional): Filter by language
- `file_extensions` (array, optional): Filter by file extensions
- `min_similarity` (float, optional): Minimum similarity score (0.0-1.0)

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "authentication function",
    "results": [
      {
        "id": "chunk_123",
        "content": "def authenticate_user(username, password):\n    user = get_user_by_username(username)\n    if user and verify_password(password, user.password):\n        return create_jwt_token(user)\n    return None",
        "file_path": "src/auth/user.py",
        "line_start": 15,
        "line_end": 20,
        "similarity": 0.89,
        "language": "python",
        "metadata": {
          "function_name": "authenticate_user",
          "class_name": null,
          "docstring": "Authenticate user with username and password"
        }
      }
    ],
    "total_results": 1,
    "search_time": "0.15s"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "authentication function",
    "limit": 5,
    "language": "python"
  }'
```

### Find Similar Code

**Endpoint:** `POST /similar`

**Description:** Find code similar to a given snippet.

**Request Body:**
```json
{
  "code": "def authenticate_user(username, password):\n    user = get_user_by_username(username)\n    if user and verify_password(password, user.password):\n        return create_jwt_token(user)\n    return None",
  "language": "python",
  "limit": 10,
  "min_similarity": 0.7
}
```

**Parameters:**
- `code` (string, required): Code snippet to find similar code for
- `language` (string, required): Programming language of the code
- `limit` (integer, optional): Maximum results (default: 10)
- `min_similarity` (float, optional): Minimum similarity score (0.0-1.0)

**Response:**
```json
{
  "success": true,
  "data": {
    "input_code": "def authenticate_user(username, password):...",
    "results": [
      {
        "id": "chunk_456",
        "content": "def login_user(email, password):\n    user = User.query.filter_by(email=email).first()\n    if user and user.check_password(password):\n        return generate_token(user)\n    return None",
        "file_path": "src/auth/login.py",
        "line_start": 25,
        "line_end": 30,
        "similarity": 0.85,
        "language": "python",
        "metadata": {
          "function_name": "login_user",
          "class_name": null
        }
      }
    ],
    "total_results": 1,
    "search_time": "0.12s"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/similar \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def authenticate_user(username, password):\n    user = get_user_by_username(username)\n    if user and verify_password(password, user.password):\n        return create_jwt_token(user)\n    return None",
    "language": "python",
    "limit": 5
  }'
```

---

## AI Features

### AI Answer

**Endpoint:** `POST /ai/answer`

**Description:** Get AI-powered answers about your codebase.

**Request Body:**
```json
{
  "question": "How does the authentication system work?",
  "context_files": ["src/auth/user.py", "src/auth/middleware.py"],
  "include_code": true,
  "max_tokens": 1000
}
```

**Parameters:**
- `question` (string, required): Question about the codebase
- `context_files` (array, optional): Specific files to include as context
- `include_code` (boolean, optional): Include code examples in answer
- `max_tokens` (integer, optional): Maximum tokens for response

**Response:**
```json
{
  "success": true,
  "data": {
    "question": "How does the authentication system work?",
    "answer": "The authentication system in this codebase uses JWT tokens...",
    "context_used": [
      "src/auth/user.py",
      "src/auth/middleware.py"
    ],
    "tokens_used": 450,
    "model": "gpt-4.1-turbo",
    "response_time": "2.3s"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/ai/answer \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How does the authentication system work?",
    "include_code": true,
    "max_tokens": 1000
  }'
```

### AI Settings

**Endpoint:** `GET /ai/settings`

**Description:** Get current AI configuration.

**Response:**
```json
{
  "success": true,
  "data": {
    "model": "gpt-4.1-turbo",
    "max_tokens": 2000,
    "temperature": 0.7,
    "api_key_configured": true,
    "available_models": ["gpt-4.1-turbo", "gpt-4.1-nano"]
  }
}
```

**Example:**
```bash
curl http://localhost:8000/api/ai/settings
```

**Endpoint:** `POST /ai/settings`

**Description:** Update AI configuration.

**Request Body:**
```json
{
  "api_key": "sk-...",
  "model": "gpt-4.1-turbo",
  "max_tokens": 2000,
  "temperature": 0.7
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "model": "gpt-4.1-turbo",
    "max_tokens": 2000,
    "temperature": 0.7,
    "api_key_configured": true
  },
  "message": "AI settings updated successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/ai/settings \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "sk-your-api-key",
    "model": "gpt-4.1-turbo",
    "max_tokens": 2000
  }'
```

---

## Repository Management

### Get Repository Info

**Endpoint:** `GET /repository`

**Description:** Get information about the current repository.

**Response:**
```json
{
  "success": true,
  "data": {
    "path": "/path/to/repository",
    "name": "my-project",
    "indexed_files": 1250,
    "total_chunks": 5678,
    "supported_languages": ["python", "javascript", "typescript"],
    "file_extensions": {
      "py": 450,
      "js": 300,
      "ts": 500
    },
    "last_indexed": "2025-01-15T10:30:00Z",
    "index_status": "complete"
  }
}
```

**Example:**
```bash
curl http://localhost:8000/api/repository
```

### Get File Info

**Endpoint:** `GET /files/{file_path}`

**Description:** Get information about a specific file.

**Response:**
```json
{
  "success": true,
  "data": {
    "path": "src/auth/user.py",
    "language": "python",
    "size": 2048,
    "lines": 150,
    "chunks": 25,
    "last_modified": "2025-01-15T10:30:00Z",
    "functions": [
      {
        "name": "authenticate_user",
        "line_start": 15,
        "line_end": 25
      }
    ],
    "classes": [
      {
        "name": "User",
        "line_start": 30,
        "line_end": 80
      }
    ]
  }
}
```

**Example:**
```bash
curl http://localhost:8000/api/files/src/auth/user.py
```

---

## Error Codes

### HTTP Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Endpoint or resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "field": "specific error details",
    "code": "ERROR_CODE"
  }
}
```

### Common Error Codes

- `INVALID_PATH`: Invalid file or directory path
- `FILE_NOT_FOUND`: File does not exist
- `UNSUPPORTED_LANGUAGE`: Language not supported
- `INDEXING_FAILED`: Failed to index files
- `SEARCH_FAILED`: Search operation failed
- `AI_CONFIG_ERROR`: AI configuration error
- `API_KEY_INVALID`: Invalid OpenAI API key

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing rate limiting based on your requirements.

---

## Caching

The API uses caching for:
- Search results (TTL: 1 hour)
- File metadata (TTL: 24 hours)
- AI responses (TTL: 1 hour)

Cache can be cleared via the `/clear` endpoint.

---

## Examples

### Complete Workflow

```bash
# 1. Check health
curl http://localhost:8000/api/health

# 2. Index repository
curl -X POST http://localhost:8000/api/index \
  -H "Content-Type: application/json" \
  -d '{"path": "./src", "recursive": true}'

# 3. Search for code
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "authentication", "limit": 5}'

# 4. Get AI answer
curl -X POST http://localhost:8000/api/ai/answer \
  -H "Content-Type: application/json" \
  -d '{"question": "How does authentication work?"}'

# 5. Check statistics
curl http://localhost:8000/api/stats
```

### Python Client Example

```python
import requests

class DevFlowClient:
    def __init__(self, base_url="http://localhost:8000/api"):
        self.base_url = base_url
    
    def search(self, query, limit=10):
        response = requests.post(
            f"{self.base_url}/search",
            json={"query": query, "limit": limit}
        )
        return response.json()
    
    def get_ai_answer(self, question):
        response = requests.post(
            f"{self.base_url}/ai/answer",
            json={"question": question}
        )
        return response.json()
    
    def index_repository(self, path="./src"):
        response = requests.post(
            f"{self.base_url}/index",
            json={"path": path, "recursive": True}
        )
        return response.json()

# Usage
client = DevFlowClient()
results = client.search("authentication function")
print(results)
```

### JavaScript Client Example

```javascript
class DevFlowClient {
    constructor(baseUrl = 'http://localhost:8000/api') {
        this.baseUrl = baseUrl;
    }
    
    async search(query, limit = 10) {
        const response = await fetch(`${this.baseUrl}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, limit })
        });
        return response.json();
    }
    
    async getAiAnswer(question) {
        const response = await fetch(`${this.baseUrl}/ai/answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });
        return response.json();
    }
}

// Usage
const client = new DevFlowClient();
client.search('authentication function').then(results => {
    console.log(results);
});
```

This API reference provides comprehensive documentation for all DevFlow backend endpoints. For more information, see the [Backend Overview](backend_overview.md) and [Backend API](backend_api.md) pages. 