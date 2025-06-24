# DevFlow Backend

The backend service for DevFlow, an AI-powered contextual assistant for developers.

## Project Structure

```
backend/
├── app/                    # Application package
│   ├── api/               # API endpoints
│   │   └── v1/           # API version 1
│   ├── core/             # Core functionality
│   ├── db/               # Database models and connections
│   ├── middleware/       # Request/response middleware
│   ├── models/           # Data models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic services
│   ├── static/           # Static files
│   ├── templates/        # HTML templates
│   └── utils/            # Utility functions
├── data/                 # Data storage
│   ├── example_repo/     # Example repository for testing
│   └── vector_store/     # Vector store data
├── tests/               # Test suite
├── .env.example        # Example environment variables
├── Dockerfile          # Container definition
├── Makefile           # Build automation
├── requirements.txt    # Python dependencies
└── setup.py           # Package setup
```

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

4. Install the package in development mode:
   ```bash
   pip install -e .
   ```

## Development

- Run tests:
  ```bash
  make test
  ```

- Run linting:
  ```bash
  make lint
  ```

- Start the development server:
  ```bash
  make run
  ```

## API Documentation

The API documentation is available at `/docs` when the server is running.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
