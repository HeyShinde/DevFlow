# Security

Security is crucial for protecting your codebase and API access. This guide covers security best practices for the DevFlow backend.

---

## API Key Management

### OpenAI API Key

The backend uses OpenAI API keys for AI features. Secure your keys properly:

```bash
# Environment variable (recommended)
export OPENAI_API_KEY="sk-your-secret-key"

# Or in .env file (ensure it's not committed to git)
OPENAI_API_KEY=sk-your-secret-key
```

### Security Best Practices

- **Never commit API keys** to version control
- **Use environment variables** instead of hardcoded values
- **Rotate keys regularly** for better security
- **Use different keys** for development and production
- **Monitor API usage** to detect unauthorized access

---

## Environment Variables

### Secure Configuration

```bash
# Production .env file (never commit this)
OPENAI_API_KEY=sk-production-key
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=false
LOG_LEVEL=WARNING

# Development .env file (can be committed)
OPENAI_API_KEY=sk-dev-key
API_HOST=127.0.0.1
API_PORT=8000
DEBUG=true
LOG_LEVEL=DEBUG
```

### Environment Variable Security

```bash
# Set file permissions
chmod 600 .env

# Use secrets management in production
# AWS Secrets Manager, Azure Key Vault, etc.
```

---

## Authentication

### Current State

The DevFlow backend currently does not require authentication. For production use, consider implementing:

### API Key Authentication

```python
# Example implementation
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_api_key(credentials = Depends(security)):
    if credentials.credentials != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return credentials.credentials

@router.post("/search")
async def search_codebase(request: SearchRequest, api_key = Depends(verify_api_key)):
    # Protected endpoint
    pass
```

### JWT Authentication

```python
# Example JWT implementation
import jwt
from datetime import datetime, timedelta

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## Rate Limiting

### Built-in Protection

The backend includes rate limiting to prevent abuse:

```python
# Configuration
RATE_LIMIT_REQUESTS = 100  # requests per window
RATE_LIMIT_WINDOW = 3600   # seconds (1 hour)
```

### Custom Rate Limiting

```python
# Per-endpoint rate limiting
@router.post("/search")
@rate_limit(max_requests=50, window=3600)
async def search_codebase(request: SearchRequest):
    pass

# IP-based rate limiting
@router.post("/index")
@rate_limit(max_requests=10, window=3600, key_func=get_client_ip)
async def index_codebase(request: IndexRequest):
    pass
```

---

## Input Validation

### Request Validation

All API endpoints use Pydantic models for automatic validation:

```python
class SearchRequest(BaseModel):
    query: str
    limit: int = Field(ge=1, le=50)  # Between 1 and 50

class IndexRequest(BaseModel):
    path: str
    recursive: bool = True
    extensions: Optional[List[str]] = None
```

### File Path Validation

```python
# Validate file paths to prevent directory traversal
def validate_file_path(path: str) -> bool:
    # Ensure path is within workspace
    workspace_root = get_workspace_root()
    abs_path = os.path.abspath(path)
    return abs_path.startswith(workspace_root)

# Usage
if not validate_file_path(request.path):
    raise HTTPException(status_code=400, detail="Invalid file path")
```

---

## HTTPS and TLS

### Production Deployment

Always use HTTPS in production:

```bash
# Generate SSL certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Run with SSL
uvicorn app.main:app --ssl-keyfile=key.pem --ssl-certfile=cert.pem
```

### Reverse Proxy

Use a reverse proxy like Nginx:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Data Security

### Vector Database Security

```bash
# Secure ChromaDB storage
CHROMA_DB_PATH=/secure/path/to/vector_store
chmod 700 /secure/path/to/vector_store

# Backup encryption
tar -czf backup.tar.gz --encrypt --password=secure_password data/
```

### Metadata Database Security

```bash
# SQLite database security
METADATA_DB_PATH=/secure/path/to/metadata.db
chmod 600 /secure/path/to/metadata.db

# Regular backups
sqlite3 metadata.db ".backup '/backup/metadata-$(date +%Y%m%d).db'"
```

---

## Logging and Monitoring

### Security Logging

```python
# Log security events
import logging

security_logger = logging.getLogger("security")

def log_security_event(event_type: str, details: dict):
    security_logger.warning(f"Security event: {event_type}", extra=details)

# Usage
log_security_event("rate_limit_exceeded", {
    "ip": client_ip,
    "endpoint": "/search",
    "timestamp": datetime.now().isoformat()
})
```

### Monitoring

```python
# Monitor suspicious activity
from collections import defaultdict
import time

request_counts = defaultdict(list)

def monitor_requests(client_ip: str, endpoint: str):
    now = time.time()
    request_counts[client_ip].append(now)
    
    # Clean old requests
    request_counts[client_ip] = [t for t in request_counts[client_ip] 
                                if now - t < 3600]
    
    # Alert if too many requests
    if len(request_counts[client_ip]) > 1000:
        log_security_event("suspicious_activity", {
            "ip": client_ip,
            "requests": len(request_counts[client_ip])
        })
```

---

## Production Security Checklist

### Before Deployment

- [ ] **API Keys**: Secured and rotated
- [ ] **Environment Variables**: Properly configured
- [ ] **HTTPS**: SSL certificates installed
- [ ] **Authentication**: Implemented if needed
- [ ] **Rate Limiting**: Configured appropriately
- [ ] **Input Validation**: All endpoints validated
- [ ] **File Permissions**: Secure file access
- [ ] **Logging**: Security events logged
- [ ] **Monitoring**: Suspicious activity detection
- [ ] **Backups**: Regular encrypted backups

### Ongoing Security

- [ ] **Regular Updates**: Keep dependencies updated
- [ ] **Security Audits**: Regular security reviews
- [ ] **Access Monitoring**: Monitor API usage
- [ ] **Incident Response**: Plan for security incidents
- [ ] **Compliance**: Meet relevant compliance requirements

---

## Security Headers

### Add Security Headers

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add security headers
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

### CORS Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

Following these security practices ensures your DevFlow backend is secure and ready for production use. 