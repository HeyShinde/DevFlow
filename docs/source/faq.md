# Frequently Asked Questions (FAQ)

Common questions and answers about DevFlow.

---

## General Questions

### What is DevFlow?

DevFlow is an AI-powered contextual assistant for developers that helps you search, understand, and manage your codebase using natural language, advanced code analysis, and repository insights—all from within Visual Studio Code.

### How does DevFlow work?

DevFlow consists of a VS Code extension (frontend) and a Python backend server. The extension provides a user interface, while the backend handles code indexing, embeddings, and AI-powered responses. It uses vector embeddings to enable semantic search across your codebase.

### What programming languages does DevFlow support?

DevFlow supports multiple programming languages including Python, JavaScript, TypeScript, Java, Go, C++, C#, Rust, PHP, and C. The backend can parse and index code written in these languages.

---

## Installation & Setup

### How do I install DevFlow?

1. Install the DevFlow extension from the VS Code Marketplace
2. Open the DevFlow sidebar in VS Code
3. The extension will automatically set up the backend on first use

### Do I need to install Python separately?

Yes, you need Python 3.11+ installed on your system. The extension will automatically create a virtual environment and install dependencies.

### What if the backend setup fails?

Check that:
- Python 3.11+ is installed and in your PATH
- You have internet connection for downloading dependencies
- Port 8000 is available
- You have sufficient disk space

### Can I run the backend manually?

Yes, you can run the backend manually for development or debugging:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## Usage

### How do I search my codebase?

1. Open the DevFlow sidebar
2. Go to the "Search" tab
3. Enter your query in natural language or keywords
4. Click "Search" or press Ctrl+Enter

### What types of queries can I use?

You can use:
- **Natural language**: "How does authentication work?"
- **Keywords**: "authentication function"
- **Specific patterns**: "class that implements singleton"
- **File types**: "Python functions for database operations"

### How do I get AI-powered answers?

1. In the "Search" tab, enter your question
2. Click "AI Answer" instead of "Search"
3. Make sure you have configured your OpenAI API key in "AI Settings"

### How do I find similar code?

1. Go to the "Find Similar" tab
2. Paste a code snippet
3. Select the programming language
4. Click "Find Similar"

### How do I index my repository?

1. Go to the "Repository" tab
2. Optionally specify file extensions to include
3. Click "Index Repository"
4. Wait for the indexing to complete

---

## Configuration

### How do I configure my OpenAI API key?

1. Go to the "AI Settings" tab in the sidebar
2. Enter your OpenAI API key
3. Optionally adjust the model and token limit
4. Click "Save AI Settings"

### Where can I get an OpenAI API key?

1. Go to [OpenAI's website](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key

### Can I change the backend URL?

Yes, you can change the API URL in VS Code settings:
1. Open Settings (Ctrl+,)
2. Search for "DevFlow"
3. Modify the "DevFlow: API URL" setting

### How do I adjust search result limits?

You can change the default limit in VS Code settings or specify a limit for each search query in the UI.

---

## Troubleshooting

### The backend won't start

**Common solutions:**
- Check Python installation: `python --version`
- Verify port 8000 is free: `netstat -an | grep 8000`
- Check the logs in the "Logs" tab
- Try running the backend manually

### I get no search results

**Possible causes:**
- Repository not indexed (check "Repository" tab)
- Files not in supported languages
- Search query too specific
- Backend not running

**Solutions:**
- Index your repository first
- Check file extensions are supported
- Try broader search terms
- Verify backend is healthy

### AI features don't work

**Check:**
- OpenAI API key is configured correctly
- Internet connection is available
- API key has sufficient credits
- Model selection is appropriate

### Search is slow

**Optimization tips:**
- Reduce result limits
- Use more specific queries
- Enable caching
- Check system resources

### Memory usage is high

**Solutions:**
- Reduce batch sizes in backend configuration
- Clear cache periodically
- Restart the backend
- Monitor system resources

---

## Performance

### How much disk space does DevFlow use?

Disk usage depends on your codebase size:
- **Small projects** (< 1000 files): ~100-500 MB
- **Medium projects** (1000-10000 files): ~500 MB - 2 GB
- **Large projects** (> 10000 files): ~2 GB+

### How much memory does DevFlow use?

Memory usage varies:
- **Backend**: 100-500 MB typically
- **Extension**: Minimal memory usage
- **Vector database**: Depends on codebase size

### Can DevFlow handle large codebases?

Yes, but consider:
- Index large codebases in chunks
- Use selective file extensions
- Monitor system resources
- Use SSD storage for better performance

### How fast is the search?

Search speed depends on:
- Codebase size
- Query complexity
- System resources
- Cache settings

Typical response times: 100ms - 2 seconds

---

## Security

### Is my code sent to external services?

- **Code indexing**: Stored locally in vector database
- **Search queries**: Processed locally
- **AI answers**: Code context sent to OpenAI (if using AI features)
- **No code is stored** on external servers permanently

### How secure is the backend?

The backend runs locally on your machine. For production use, consider:
- Adding authentication
- Using HTTPS
- Implementing rate limiting
- Securing API keys

### Can I use DevFlow offline?

- **Basic search**: Works offline
- **AI features**: Require internet connection
- **Indexing**: Works offline
- **Similar code search**: Works offline

---

## Development

### Can I contribute to DevFlow?

Yes! See the [Contributing](contributing.md) guide for details on:
- Setting up development environment
- Code style guidelines
- Testing procedures
- Pull request process

### How do I report bugs?

1. Check existing issues on GitHub
2. Create a new issue with:
   - Clear description of the bug
   - Steps to reproduce
   - Environment details
   - Screenshots if relevant

### How do I request features?

1. Check existing feature requests
2. Create a new issue with:
   - Feature description
   - Use case
   - Proposed solution
   - Alternatives considered

### Can I extend DevFlow?

Yes, DevFlow is designed to be extensible:
- Add new language support
- Customize embedding models
- Extend API endpoints
- Modify UI components

---

## Support

### Where can I get help?

- **Documentation**: This site
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **VS Code Marketplace**: For extension issues

### How do I update DevFlow?

- **Extension**: Update through VS Code Marketplace
- **Backend**: Update dependencies with `pip install -r requirements.txt`
- **Check changelog**: For breaking changes

### Is DevFlow free to use?

- **Extension**: Free
- **Backend**: Free to run locally
- **AI features**: Require OpenAI API credits (you pay OpenAI directly)

---

## Advanced

### Can I use custom embedding models?

Yes, you can configure different embedding models via environment variables. See the [Customization](backend_customization.md) guide.

### How do I backup my index?

The index is stored in:
- **Vector data**: `./data/vector_store/`
- **Metadata**: `./data/metadata.db`

Backup these directories to preserve your index.

### Can I use DevFlow with multiple projects?

Yes, each workspace can have its own index. The backend automatically detects the workspace and manages separate indexes.

### How do I clear the index?

Go to the "Repository" tab and click "Clear Index". This removes all indexed data and embeddings.

---

## Still Have Questions?

If you couldn't find the answer here:
1. Check the [documentation](index.md)
2. Search [GitHub Issues](https://github.com/heyshinde/devflow/issues)
3. Start a [GitHub Discussion](https://github.com/heyshinde/devflow/discussions)
4. Create a new issue with your question 