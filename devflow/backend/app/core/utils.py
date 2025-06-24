import os

def get_workspace_root():
    root = os.environ.get("WORKSPACE_ROOT")
    if root and os.path.isdir(root):
        return os.path.abspath(root)
    # fallback: parent of backend/app/
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../")) 