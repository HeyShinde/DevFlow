# Advanced Usage

This guide covers advanced features, optimization techniques, and best practices for getting the most out of DevFlow.

---

## Large Codebase Optimization

### Indexing Strategies

For large repositories, consider these indexing strategies:

**Selective Indexing:**
```bash
# Index only specific directories
POST /api/index
{
  "path": "./src/core",
  "recursive": true,
  "extensions": ["py", "js", "ts"]
}

# Index multiple directories separately
POST /api/index
{
  "path": "./src/api",
  "recursive": true,
  "extensions": ["py"]
}
```

**File Extension Filtering:**
```bash
# Focus on main code files
extensions: ["py", "js", "ts", "java", "go"]

# Exclude test files
extensions: ["py", "js", "ts"]  # Don't include "test.py", "spec.js"
```

### Performance Tips

- **Batch Processing**: Index large codebases in smaller chunks
- **Memory Management**: Monitor memory usage during indexing
- **Storage**: Use SSD storage for vector database
- **Caching**: Enable caching for frequently accessed data

---

## Advanced Search Techniques

### Semantic Search Queries

**Function-Specific Searches:**
```
"authentication function that validates JWT tokens"
"database connection pooling implementation"
"error handling middleware for API requests"
```

**Pattern-Based Searches:**
```
"class that implements singleton pattern"
"function that uses decorator pattern"
"async function with error handling"
```

### Code Similarity Search

**Finding Similar Patterns:**
```python
# Find similar authentication functions
code_snippet = """
def authenticate_user(username, password):
    user = get_user_by_username(username)
    if user and verify_password(password, user.password):
        return create_jwt_token(user)
    return None
"""
```

**Language-Specific Search:**
- Use the language selector for better results
- Different languages have different parsing strategies
- Consider code style and conventions

---

## AI-Powered Code Understanding

### Effective Question Formulation

**Good Questions:**
- "How does the authentication system work?"
- "What are the main components of the API layer?"
- "Show me examples of error handling patterns"
- "Explain the database schema design"

**Context-Rich Queries:**
- "In the context of user management, how are passwords handled?"
- "Given the current API structure, how should I add a new endpoint?"

### Token Management

**Optimizing Token Usage:**
```bash
# Adjust token limits based on your needs
OPENAI_TOKEN_LIMIT=1024  # For concise answers
OPENAI_TOKEN_LIMIT=4096  # For detailed explanations
```

**Model Selection:**
```bash
# Different models for different use cases
OPENAI_MODEL=gpt-4.1-nano    # Fast, cost-effective
OPENAI_MODEL=gpt-4.1-turbo   # More detailed responses
```

---

## Repository Management

### Index Health Monitoring

**Regular Health Checks:**
```bash
GET /api/health
GET /api/stats?debug=true
```

**Monitoring Index Quality:**
- Check file count vs vector count
- Monitor embedding dimensions
- Review sample files in index

### Index Maintenance

**When to Re-index:**
- After major code refactoring
- When adding new file types
- After significant code changes
- If search quality degrades

**Partial Re-indexing:**
```bash
# Clear and re-index specific areas
POST /api/clear
POST /api/index
{
  "path": "./src/modified-module",
  "recursive": true
}
```

---

## Customization for Workflows

### IDE Integration

**VS Code Settings:**
```json
{
  "devflow.apiUrl": "http://localhost:8000/api",
  "devflow.defaultLimit": 10,
  "devflow.autoIndex": true
}
```

**Keyboard Shortcuts:**
- `Ctrl+Enter`: Quick search
- `Ctrl+1/2/3`: Switch tabs
- `Ctrl+Shift+P`: Command palette

### Team Collaboration

**Shared Configuration:**
- Use consistent API settings across team
- Share common search patterns
- Document team-specific workflows

**Code Review Integration:**
- Use DevFlow to understand code changes
- Search for similar patterns in codebase
- Get AI explanations for complex changes

---

## Troubleshooting

### Common Issues

**Backend Won't Start:**
```bash
# Check Python installation
python --version

# Verify dependencies
pip list | grep -E "(fastapi|chromadb|openai)"

# Check port availability
netstat -an | grep 8000
```

**No Search Results:**
```bash
# Verify indexing
GET /api/stats

# Check file extensions
# Ensure files are in supported languages

# Re-index if necessary
POST /api/index
```

**AI Features Not Working:**
```bash
# Verify OpenAI API key
echo $OPENAI_API_KEY

# Test API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models
```

### Performance Issues

**Slow Indexing:**
- Reduce batch size: `EMBEDDING_BATCH_SIZE=50`
- Use SSD storage
- Increase system memory

**Slow Search:**
- Enable caching: `CACHE_TTL=3600`
- Reduce result limit
- Optimize vector database

**Memory Issues:**
- Monitor memory usage
- Reduce batch sizes
- Clear cache periodically

---

## Best Practices

### Code Organization

**File Structure:**
```
project/
├── src/
│   ├── core/          # Core functionality
│   ├── api/           # API endpoints
│   ├── utils/         # Utility functions
│   └── tests/         # Test files
├── docs/              # Documentation
└── config/            # Configuration files
```

**Naming Conventions:**
- Use descriptive function and class names
- Follow language-specific conventions
- Include docstrings and comments

### Search Optimization

**Query Strategies:**
- Start with specific terms
- Use natural language for complex queries
- Combine keywords with context

**Result Filtering:**
- Use file extensions to focus search
- Leverage language-specific features
- Review and refine results

### Maintenance

**Regular Tasks:**
- Monitor index health
- Update dependencies
- Review and clean old data
- Backup important configurations

**Performance Monitoring:**
- Track search response times
- Monitor API usage
- Check system resources
- Review error logs

---

## Integration Examples

### CI/CD Integration

**Automated Indexing:**
```yaml
# GitHub Actions example
- name: Index Codebase
  run: |
    curl -X POST http://localhost:8000/api/index \
      -H "Content-Type: application/json" \
      -d '{"path": "./src", "recursive": true}'
```

### Custom Scripts

**Batch Processing:**
```python
import requests

def index_multiple_dirs():
    dirs = ["./src/api", "./src/core", "./src/utils"]
    for dir in dirs:
        response = requests.post(
            "http://localhost:8000/api/index",
            json={"path": dir, "recursive": True}
        )
        print(f"Indexed {dir}: {response.status_code}")
```

**Search Automation:**
```python
def search_patterns():
    patterns = [
        "authentication function",
        "database connection",
        "error handling"
    ]
    
    for pattern in patterns:
        response = requests.post(
            "http://localhost:8000/api/search",
            json={"query": pattern, "limit": 5}
        )
        results = response.json()
        print(f"Pattern: {pattern}")
        print(f"Results: {len(results['chunks'])}")
```

These advanced techniques help you maximize the value of DevFlow in your development workflow. 