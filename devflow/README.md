# DevFlow - AI-Powered Code Assistant

DevFlow is an intelligent VS Code extension that provides AI-powered code search, understanding, and repository insights. It helps developers quickly understand codebases, find relevant code, and get contextual assistance.

## Features

### 🤖 AI-Powered Code Search
- **Semantic Search**: Find code using natural language queries
- **Context-Aware Results**: Get relevant code snippets with explanations
- **Repository Indexing**: Automatically index your entire codebase for fast searches

### 📊 Repository Insights
- **Code Statistics**: Get detailed analytics about your codebase
- **File Relationships**: Understand dependencies and connections between files
- **Code Patterns**: Identify common patterns and structures

### 💡 Intelligent Code Understanding
- **Code Explanation**: Get detailed explanations of selected code
- **Context Analysis**: Understand how code fits into the larger codebase
- **Best Practices**: Receive suggestions for code improvements

### 🔧 Easy Integration
- **Sidebar Interface**: Access all features from a dedicated sidebar
- **Command Palette**: Quick access to all commands
- **Context Menus**: Right-click integration for common actions

## Quick Start

1. **Install the Extension**: Search for "DevFlow" in the VS Code marketplace
2. **Start Backend**: Use the command `DevFlow: Start Backend Server`
3. **Index Repository**: Right-click in the explorer and select "DevFlow: Index Repository"
4. **Ask Questions**: Use the sidebar or command palette to ask questions about your code

## Commands

- `DevFlow: Ask Question About Codebase` - Ask natural language questions about your code
- `DevFlow: Explain Selected Code` - Get detailed explanation of selected code
- `DevFlow: Index Repository` - Index the current repository for search
- `DevFlow: Get Repository Stats` - View codebase statistics
- `DevFlow: Start Backend Server` - Start the AI backend server
- `DevFlow: Stop Backend Server` - Stop the backend server
- `DevFlow: Show Getting Started` - Open the getting started guide

## Configuration

### Backend API URL
Set the backend API URL in settings:
```json
{
  "devflow.apiUrl": "http://localhost:8000/api"
}
```

### Default Results Limit
Configure the default number of results:
```json
{
  "devflow.defaultLimit": 5
}
```

## Requirements

- VS Code 1.101.0 or higher
- Python 3.11+ (for backend)
- OpenAI API key (configured in backend)

## Backend Setup

The extension requires a Python backend server. See the [backend documentation](https://github.com/heyshinde/DevFlow/tree/main/backend) for setup instructions.

## Contributing

We welcome contributions! Please see our [contributing guide](https://github.com/heyshinde/DevFlow/blob/main/CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](https://github.com/heyshinde/DevFlow/blob/main/LICENSE) for details.

## Support

- 📖 [Documentation](https://heyshinde.github.io/DevFlow/)
- 🐛 [Report Issues](https://github.com/heyshinde/DevFlow/issues)
- 💬 [Discussions](https://github.com/heyshinde/DevFlow/discussions)

---

**Made with ❤️ for developers**
