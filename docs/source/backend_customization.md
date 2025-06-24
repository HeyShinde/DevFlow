# Customization

The DevFlow backend is highly customizable to suit different use cases and requirements.

---

## Supported Languages

The backend supports indexing and parsing for multiple programming languages:

### Fully Supported
- **Python** (`.py`) - Functions, classes, docstrings
- **JavaScript** (`.js`) - Functions, classes, JSDoc
- **TypeScript** (`.ts`) - Functions, classes, interfaces, types
- **Java** (`.java`) - Methods, classes, interfaces
- **Go** (`.go`) - Functions, structs, methods
- **C++** (`.cpp`, `.cc`, `.cxx`) - Functions, classes
- **C#** (`.cs`) - Methods, classes, interfaces
- **Rust** (`.rs`) - Functions, structs, traits
- **PHP** (`.php`) - Functions, classes
- **C** (`.c`) - Functions, structs

### Language Mapping
```python
LANGUAGE_MAP = {
    'py': 'python', 'js': 'javascript', 'ts': 'typescript', 
    'java': 'java', 'go': 'go', 'rb': 'ruby',
    'cpp': 'cpp', 'cc': 'cpp', 'cxx': 'cpp', 'cs': 'csharp', 
    'kt': 'kotlin', 'php': 'php', 'c': 'c',
    'rs': 'rust', 'scala': 'scala', 'swift': 'swift'
}
```

---

## Embedding Models

### Default Model
- **text-embedding-ada-002**: OpenAI's recommended embedding model
- **Dimensions**: 1536
- **Performance**: Fast and accurate for code embeddings

### Alternative Models
You can configure different embedding models via environment variables:

```bash
# OpenAI Models
EMBEDDING_MODEL=text-embedding-ada-002
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_MODEL=text-embedding-3-large

# Custom Models (if supported)
EMBEDDING_MODEL=custom-model-endpoint
```

---

## Advanced Configuration

### Environment Variables

```bash
# API Configuration
API_HOST=127.0.0.1
API_PORT=8000
DEBUG=false

# OpenAI Configuration
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4.1-nano
OPENAI_TOKEN_LIMIT=2048
OPENAI_TIMEOUT=30

# Embedding Configuration
EMBEDDING_MODEL=text-embedding-ada-002
EMBEDDING_BATCH_SIZE=100
EMBEDDING_TIMEOUT=60

# Database Configuration
CHROMA_DB_PATH=./data/vector_store
METADATA_DB_PATH=./data/metadata.db

# Cache Configuration
CACHE_TTL=3600
CACHE_MAX_SIZE=1000

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# Workspace
WORKSPACE_ROOT=/path/to/workspace
```

### Performance Tuning

```bash
# Increase batch size for faster indexing
EMBEDDING_BATCH_SIZE=200

# Adjust cache settings
CACHE_TTL=7200
CACHE_MAX_SIZE=2000

# Modify rate limits
RATE_LIMIT_REQUESTS=500
RATE_LIMIT_WINDOW=3600
```

---

## Extending the Backend

### Adding New Languages

1. **Update Language Map**:
```python
# In app/api/v1/endpoints.py
LANGUAGE_MAP['new_ext'] = 'new_language'
```

2. **Extend Code Parser**:
```python
# In app/services/code_parser.py
def parse_new_language(self, code: str):
    # Implement language-specific parsing
    pass
```

3. **Add Language Support**:
```python
def extract_functions_new_language(self, parsed_code, source_code):
    # Extract functions for the new language
    pass
```

### Custom Embedding Models

1. **Create Custom Embedder**:
```python
class CustomEmbedder:
    def embed(self, texts: List[str]) -> List[List[float]]:
        # Implement custom embedding logic
        pass
```

2. **Update Configuration**:
```python
# In app/services/embedder.py
if settings.EMBEDDING_MODEL == "custom":
    embedder = CustomEmbedder()
```

### Custom Search Logic

1. **Extend Vector Store**:
```python
class CustomVectorStore(VectorStore):
    def custom_search(self, query: str, **kwargs):
        # Implement custom search logic
        pass
```

2. **Add Custom Endpoints**:
```python
@router.post("/custom_search")
async def custom_search(request: CustomSearchRequest):
    # Implement custom search endpoint
    pass
```

---

## Deployment Customization

### Docker Configuration

```dockerfile
# Custom Dockerfile
FROM python:3.9-slim

# Install custom dependencies
RUN pip install custom-package

# Copy custom configuration
COPY custom_config.py /app/

# Set custom environment
ENV CUSTOM_SETTING=value
```

### Production Settings

```bash
# Production environment variables
DEBUG=false
LOG_LEVEL=WARNING
API_HOST=0.0.0.0
API_PORT=8000

# Security settings
ENABLE_AUTH=true
API_KEY=your_secure_api_key

# Performance settings
WORKERS=4
MAX_CONNECTIONS=1000
```

---

## Monitoring and Logging

### Custom Logging

```python
# Custom logging configuration
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('devflow.log'),
        logging.StreamHandler()
    ]
)
```

### Metrics Collection

```python
# Add custom metrics
from prometheus_client import Counter, Histogram

search_requests = Counter('search_requests_total', 'Total search requests')
search_duration = Histogram('search_duration_seconds', 'Search request duration')
```

---

## Best Practices

### Performance
- Use appropriate batch sizes for embeddings
- Configure caching for frequently accessed data
- Monitor memory usage with large codebases
- Use SSD storage for vector database

### Security
- Keep API keys secure and rotate regularly
- Use HTTPS in production
- Implement proper authentication
- Validate all input data

### Maintenance
- Regularly update dependencies
- Monitor disk space for vector storage
- Backup metadata database
- Clear old embeddings periodically

The backend's modular architecture makes it easy to customize and extend for specific requirements. 