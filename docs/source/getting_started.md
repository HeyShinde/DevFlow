# Getting Started

## Prerequisites

Before you begin, ensure you have the following installed:

- **Visual Studio Code** (v1.101.0 or later)
- **Python 3.11+** (required for the backend)
- **Internet connection** (for AI features and model downloads)
- (Optional) **OpenAI API Key** (for advanced AI answers)

---

## Installation

### 1. Install the DevFlow Extension

- Search for **DevFlow** in the VS Code Marketplace and install it.
- Or, install from a `.vsix` file if provided:
  ```sh
  code --install-extension devflow-x.y.z.vsix
  ```

### 2. Backend Setup

**Automatic Setup (Recommended):**
- On first use, DevFlow will automatically set up the Python backend in the extension's folder.
- It creates a virtual environment, installs dependencies, and starts the backend server for you.
- You will see progress and logs in the DevFlow sidebar.

**Manual Setup (Advanced/Debugging):**
If you want to run the backend manually (e.g., for development):

```sh
cd devflow/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Edit .env as needed
pip install -e .
make run  # or: uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000` by default.

---

## Quickstart

1. **Open VS Code** and your project folder.
2. **Open the DevFlow Sidebar** (click the DevFlow icon in the Activity Bar).
3. **Start the Backend** (if not already running):
   - Click "Start Backend" in the sidebar, or use the command palette: `DevFlow: Start Backend Server`.
   - Wait for the backend to show as "healthy" in the UI.
4. **Index Your Repository**:
   - Go to the "Repository" tab and click "Index Repository".
   - Optionally, specify file extensions or include subdirectories.
5. **Search and Explore**:
   - Use the "Search" tab to ask questions or search your codebase.
   - Try "Find Similar" to discover code patterns.
   - View stats, logs, and manage settings as needed.

---

## Troubleshooting

- **Backend Fails to Start**:
  - Ensure Python 3.11+ is installed and available in your PATH.
  - Check the logs in the "Logs" tab for errors.
  - Try running the backend manually (see above).
- **No Results When Searching**:
  - Make sure your repository is indexed (see "Repository" tab).
  - Check that the correct file extensions are included.
- **AI Features Not Working**:
  - Ensure you have entered a valid OpenAI API key in "AI Settings".
  - Check your internet connection.
- **Port Conflicts**:
  - The backend uses port 8000 by default. Make sure it is free or change it in the `.env` file.
- **Other Issues**:
  - Restart VS Code and try again.
  - Check for updates to the extension.
  - Consult the logs and documentation for more help.

---

For more help, see the [Introduction](index.md) or open an issue on GitHub. 