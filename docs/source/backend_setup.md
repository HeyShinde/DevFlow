# Setup & Development

This guide covers setting up the DevFlow backend for development and production use.

---

## Prerequisites

- **Python 3.11+**: Required for the backend.
- **pip**: Python package manager.
- **Git**: For cloning the repository.

---

## Quick Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Install in Development Mode

```bash
pip install -e .
```

---

## Environment Variables

Create a `.env` file in the backend directory:

```bash
# API Configuration
API_HOST=127.0.0.1
API_PORT=8000

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-nano
OPENAI_TOKEN_LIMIT=2048

# Database Configuration
CHROMA_DB_PATH=./data/vector_store

# Workspace Configuration
WORKSPACE_ROOT=/path/to/your/workspace

# Logging
LOG_LEVEL=INFO
```

---

## Running the Backend

### Development Server

```bash
# Using Makefile
make run

# Or directly with uvicorn
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Production Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## Development Tools

### Testing

```bash
# Run all tests
make test

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_api.py
```

### Linting

```bash
# Run linting
make lint

# Or with flake8
flake8 app/ tests/
```

### Building

```bash
# Build the package
python setup.py build

# Install in development mode
pip install -e .
```

---

## Docker Setup

For containerized deployment:

```bash
# Build the image
docker build -t devflow-backend .

# Run the container
docker run -p 8000:8000 devflow-backend
```

---

## API Documentation

Once the server is running, visit:

- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/api/health

---

## Troubleshooting

### Common Issues

- **Port already in use**: Change the port in `.env` or kill the existing process.
- **Missing dependencies**: Ensure you're in the virtual environment and run `pip install -r requirements.txt`.
- **ChromaDB errors**: Clear the `data/vector_store` directory and re-index.

### Logs

Check the console output for detailed logs. Set `LOG_LEVEL=DEBUG` in `.env` for more verbose logging.

---

## Next Steps

- Read the [API Reference](backend_api.md) for endpoint documentation.
- Explore [Core Components](backend_components.md) for detailed implementation.
- Check [Customization](backend_customization.md) for advanced configuration. 