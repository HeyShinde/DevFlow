# Contributing

Thank you for your interest in contributing to DevFlow! This guide will help you get started with development and contributing to the project.

---

## Development Setup

### Prerequisites

- **Node.js 20+** (for extension development)
- **Python 3.11+** (for backend development)
- **VS Code** (for extension development)
- **Git** (for version control)

### Getting Started

1. **Fork and Clone:**
   ```bash
   git clone https://github.com/your-username/devflow.git
   cd devflow
   ```

2. **Setup Extension:**
   ```bash
   cd devflow
   npm install
   npm run compile
   ```

3. **Setup Backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   pip install -e .
   ```

---

## Extension Development

### Project Structure

```
devflow/
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── sidebar/
│   │   ├── ui.ts            # Webview UI HTML/CSS/JS
│   │   ├── SidebarProvider.ts # Webview provider
│   │   └── api.ts           # API communication
│   └── test/
│       └── extension.test.ts # Extension tests
├── package.json              # Extension manifest
└── tsconfig.json            # TypeScript configuration
```

### Development Commands

```bash
# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Run tests
npm test

# Lint code
npm run lint

# Package extension
npm run vscode:prepublish
```

### Testing the Extension

1. **Open in VS Code:**
   ```bash
   code .
   ```

2. **Press F5** to launch extension development host

3. **Test Features:**
   - Open DevFlow sidebar
   - Test search functionality
   - Verify backend communication

### Debugging

**Extension Debugging:**
- Use VS Code's built-in debugger
- Check Developer Tools console
- Monitor extension host logs

**Webview Debugging:**
- Open Developer Tools in webview
- Use `console.log()` for debugging
- Check network requests

---

## Backend Development

### Project Structure

```
backend/
├── app/
│   ├── api/                 # API endpoints
│   ├── core/               # Configuration
│   ├── db/                 # Database models
│   └── services/           # Business logic
├── tests/                  # Test suite
├── requirements.txt        # Python dependencies
└── setup.py               # Package setup
```

### Development Commands

```bash
# Run development server
make run

# Run tests
make test

# Run linting
make lint

# Install in development mode
pip install -e .
```

### Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_api.py

# Run with verbose output
pytest -v
```

### API Development

**Adding New Endpoints:**
```python
# In app/api/v1/endpoints.py
@router.post("/new_endpoint")
async def new_endpoint(request: NewRequest):
    # Implementation
    return {"message": "Success"}
```

**Adding New Services:**
```python
# In app/services/new_service.py
class NewService:
    def __init__(self):
        pass
    
    def process(self, data):
        # Implementation
        pass
```

---

## Code Style

### TypeScript/JavaScript (Extension)

**ESLint Configuration:**
- Use provided `.eslintrc.js`
- Follow TypeScript best practices
- Use meaningful variable names
- Add JSDoc comments for functions

**Example:**
```typescript
/**
 * Sends a message to the webview
 * @param message - The message to send
 */
function sendMessageToWebview(message: any): void {
    if (provider) {
        provider.sendMessageToWebview(message);
    }
}
```

### Python (Backend)

**Code Style:**
- Follow PEP 8 guidelines
- Use type hints
- Add docstrings for functions
- Use meaningful variable names

**Example:**
```python
from typing import List, Dict, Optional

def process_code_files(files: List[str], 
                      extensions: Optional[List[str]] = None) -> Dict[str, int]:
    """
    Process a list of code files and return statistics.
    
    Args:
        files: List of file paths to process
        extensions: Optional list of file extensions to include
        
    Returns:
        Dictionary containing processing statistics
    """
    # Implementation
    pass
```

---

## Testing Guidelines

### Extension Testing

**Unit Tests:**
```typescript
// extension.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('devflow'));
    });
});
```

**Integration Tests:**
- Test webview communication
- Test backend integration
- Test user interactions

### Backend Testing

**Unit Tests:**
```python
# test_services.py
import pytest
from app.services.code_parser import CodeParser

def test_code_parser():
    parser = CodeParser()
    result = parser.parse_code("def test(): pass", "python")
    assert result is not None
```

**API Tests:**
```python
# test_api.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["success"] == True
```

---

## Pull Request Process

### Before Submitting

1. **Create Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes:**
   - Follow code style guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Test Your Changes:**
   ```bash
   # Extension
   npm run test
   npm run lint
   
   # Backend
   make test
   make lint
   ```

4. **Commit Changes:**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

### Commit Message Format

Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(api): add new search endpoint
fix(ui): resolve sidebar display issue
docs(readme): update installation instructions
```

### Submitting PR

1. **Push to Fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request:**
   - Use descriptive title
   - Fill out PR template
   - Link related issues

3. **PR Template:**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   
   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   ```

---

## Issue Reporting

### Bug Reports

**Template:**
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 10, macOS 12]
- VS Code Version: [e.g., 1.70.0]
- DevFlow Version: [e.g., 0.0.1]
- Python Version: [e.g., 3.9.0]

## Additional Information
Screenshots, logs, etc.
```

### Feature Requests

**Template:**
```markdown
## Feature Description
Clear description of the feature

## Use Case
Why this feature is needed

## Proposed Solution
How you think it should work

## Alternatives Considered
Other approaches you've considered
```

---

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow project guidelines

### Communication

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Pull Requests**: For code contributions

### Getting Help

- Check existing issues and discussions
- Read the documentation thoroughly
- Ask specific, detailed questions
- Provide context and examples

---

## Release Process

### Version Management

**Extension Versioning:**
- Update `package.json` version
- Update `CHANGELOG.md`
- Tag releases in GitHub

**Backend Versioning:**
- Update `setup.py` version
- Update `CHANGELOG.md`
- Tag releases in GitHub

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version numbers updated
- [ ] Release notes prepared
- [ ] GitHub release created

Thank you for contributing to DevFlow! Your contributions help make the project better for everyone. 