.PHONY: test lint run clean install

# Python interpreter
PYTHON = python3
VENV = venv
PIP = $(VENV)/bin/pip
PYTEST = $(VENV)/bin/pytest
FLAKE8 = $(VENV)/bin/flake8
BLACK = $(VENV)/bin/black

# Default target
all: install

# Create virtual environment
venv:
	$(PYTHON) -m venv $(VENV)
	$(PIP) install --upgrade pip

# Install dependencies
install: venv
	$(PIP) install -r requirements.txt
	$(PIP) install -e .

# Run tests
test:
	$(PYTEST) tests/ -v --cov=app --cov-report=term-missing

# Run linting
lint:
	$(FLAKE8) app/ tests/
	$(BLACK) --check app/ tests/

# Format code
format:
	$(BLACK) app/ tests/

# Run the development server
run:
	$(PYTHON) -m app.main

# Clean up
clean:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info
	rm -rf .coverage
	rm -rf htmlcov/
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

# Help
help:
	@echo "Available commands:"
	@echo "  make install  - Install dependencies"
	@echo "  make test     - Run tests"
	@echo "  make lint     - Run linting"
	@echo "  make format   - Format code"
	@echo "  make run      - Run development server"
	@echo "  make clean    - Clean up build artifacts"
