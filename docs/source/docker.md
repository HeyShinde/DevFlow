# Docker Guide

This guide explains how to use Docker to run the DevFlow backend, including installation, configuration, and testing.

---

## Prerequisites

- **Docker** installed ([Get Docker](https://docs.docker.com/get-docker/))
- **Git** (to clone the repository)
- (Optional) **VS Code** for using the extension

---

## Installing Docker

### Windows & macOS
- Download Docker Desktop from [here](https://www.docker.com/products/docker-desktop/)
- Install and start Docker Desktop

### Linux
- Follow the [official instructions](https://docs.docker.com/engine/install/)
- Start Docker service:
  ```sh
  sudo systemctl start docker
  ```

---

## Using Official DevFlow Images

### Pull from GitHub Container Registry

DevFlow provides official Docker images through GitHub Container Registry (ghcr.io):

```sh
# Pull the latest version
docker pull ghcr.io/heyshinde/devflow:latest

# Pull a specific version
docker pull ghcr.io/heyshinde/devflow:v0.0.1

# Pull by branch (e.g., main branch)
docker pull ghcr.io/heyshinde/devflow:main
```

### Run Official Image

```sh
# Basic run
docker run -it --rm -p 8000:8000 ghcr.io/heyshinde/devflow:latest

# With AI features enabled
docker run -it --rm \
  -e OPENAI_API_KEY=sk-... \
  -e OPENAI_MODEL=gpt-4.1-turbo \
  -e OPENAI_TOKEN_LIMIT=2000 \
  -p 8000:8000 ghcr.io/heyshinde/devflow:latest
```

### Authentication (for private images)

If you need to access private images:

```sh
# Login to GitHub Container Registry
echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin

# Or using GitHub CLI
gh auth login
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USER --password-stdin
```

---

## Building the DevFlow Backend Image

1. **Clone the repository:**
   ```sh
   git clone https://github.com/heyshinde/devflow.git
   cd devflow
   ```

2. **Build the Docker image:**
   ```sh
   docker build -t devflow-backend -f backend/Dockerfile .
   ```
   *(Adjust the path if your Dockerfile is elsewhere.)*

---

## Running the Backend with Docker

### Basic Run
```sh
docker run -it --rm -p 8000:8000 devflow-backend
```
- `-p 8000:8000` maps the backend API to your local port 8000.
- `--rm` removes the container after it stops.

### With Environment Variables (AI API)
To use AI features, you must provide your OpenAI API key and model:

```sh
docker run -it --rm \
  -e OPENAI_API_KEY=sk-... \
  -e OPENAI_MODEL=gpt-4.1-turbo \
  -e OPENAI_TOKEN_LIMIT=2000 \
  -p 8000:8000 devflow-backend
```

**Environment Variables:**
- `OPENAI_API_KEY`: Your OpenAI API key (required for AI features)
- `OPENAI_MODEL`: Model to use (e.g., `gpt-4.1-turbo`)
- `OPENAI_TOKEN_LIMIT`: Max tokens per response (e.g., `2000`)

You can also set these in a `.env` file and use `--env-file`:
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-turbo
OPENAI_TOKEN_LIMIT=2000
```
```sh
docker run -it --rm --env-file .env -p 8000:8000 devflow-backend
```

### With Volume Mounting (for development)

```sh
# Mount your codebase for indexing
docker run -it --rm \
  -v $(pwd):/workspace \
  -e OPENAI_API_KEY=sk-... \
  -p 8000:8000 devflow-backend

# Then index your workspace
curl -X POST http://localhost:8000/api/index \
  -H "Content-Type: application/json" \
  -d '{"path": "/workspace", "recursive": true}'
```

---

## Testing the Backend API with curl

### Health Check
```sh
curl http://localhost:8000/api/health
```

### Indexing Code
```sh
curl -X POST http://localhost:8000/api/index \
  -H "Content-Type: application/json" \
  -d '{"path": "./src", "recursive": true}'
```

### Semantic Search
```sh
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "authentication function", "limit": 5}'
```

### AI Answer (requires API key)
```sh
curl -X POST http://localhost:8000/api/ai/answer \
  -H "Content-Type: application/json" \
  -d '{"question": "How does authentication work?", "max_tokens": 500}'
```

### Find Similar Code
```sh
curl -X POST http://localhost:8000/api/similar \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def authenticate_user(username, password):\n    return verify_credentials(username, password)",
    "language": "python",
    "limit": 5
  }'
```

---

## Connecting the VS Code Extension to Docker Backend

1. Start the backend container as above.
2. In VS Code, open settings (`Ctrl+,`), search for "DevFlow: API URL" and set it to:
   ```
   http://localhost:8000/api
   ```
3. Use the extension as usual. All features will work with the Docker backend.

---

## Docker Compose (Optional)

For more complex setups, you can use Docker Compose:

```yaml
# docker-compose.yml
version: '3.8'
services:
  devflow-backend:
    image: ghcr.io/heyshinde/devflow:latest
    # or build locally:
    # build:
    #   context: ./backend
    #   dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OPENAI_MODEL=${OPENAI_MODEL:-gpt-4.1-turbo}
      - OPENAI_TOKEN_LIMIT=${OPENAI_TOKEN_LIMIT:-2000}
    volumes:
      - ./data:/app/data
      - ./workspace:/workspace
    restart: unless-stopped
```

Run with:
```sh
docker-compose up -d
```

---

## Troubleshooting

- **Container won't start:**
  - Check Docker logs: `docker logs <container_id>`
  - Ensure ports are not in use
  - Verify environment variables are set correctly
- **AI features not working:**
  - Make sure `OPENAI_API_KEY` is set and valid
  - Check your OpenAI account for quota/credits
- **Cannot connect from extension:**
  - Ensure the API URL is correct and accessible
  - Check firewall or VPN settings
- **File permissions:**
  - If mounting volumes, ensure correct permissions inside the container
- **Authentication issues:**
  - Verify your GitHub token has the correct permissions
  - Check if the image is public or private

---

## Best Practices

- Use `.env` files to manage secrets (never commit them to git)
- Always use the latest stable version of Docker
- For production, consider using Docker Compose and persistent volumes
- Monitor resource usage for large codebases
- Regularly update your Docker images
- Use specific version tags instead of `latest` for production
- Consider using multi-stage builds for smaller images

---

## Example: Full Workflow

```sh
# 1. Pull the official image
docker pull ghcr.io/heyshinde/devflow:latest

# 2. Run with AI enabled
docker run -it --rm \
  -e OPENAI_API_KEY=sk-... \
  -e OPENAI_MODEL=gpt-4.1-turbo \
  -e OPENAI_TOKEN_LIMIT=2000 \
  -p 8000:8000 ghcr.io/heyshinde/devflow:latest

# 3. Test API
curl http://localhost:8000/api/health
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "authentication function"}'

# 4. Use with VS Code extension
# Set API URL to: http://localhost:8000/api
```

---

## CI/CD Integration

The DevFlow project uses GitHub Actions to automatically build and publish Docker images to GitHub Container Registry. Images are published on:

- **Main branch**: `ghcr.io/heyshinde/devflow:main`
- **Tags**: `ghcr.io/heyshinde/devflow:v0.0.1`
- **Latest**: `ghcr.io/heyshinde/devflow:latest`

See the [CI/CD workflow](https://github.com/heyshinde/devflow/blob/main/.github/workflows/ci.yml) for details.

---

## Further Reading
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [DevFlow API Reference](api_reference.md)
- [DevFlow FAQ](faq.md)
- [OpenAI API Keys](https://platform.openai.com/account/api-keys) 