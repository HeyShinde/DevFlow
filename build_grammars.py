import os
import subprocess
import shutil

def run_command(command):
    try:
        subprocess.run(command, shell=True, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running command '{command}': {e}")
        return False

def build_grammar(lang_name, repo_url, output_path):
    print(f"\nBuilding {lang_name} grammar...")
    
    # Create temporary directory for the grammar
    temp_dir = f"temp_{lang_name}"
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)
    
    try:
        # Clone the grammar repository
        if not run_command(f"git clone {repo_url} {temp_dir}"):
            return False
        
        # Build the grammar
        if not run_command(f"cd {temp_dir} && tree-sitter generate"):
            return False
        
        # Create build directory if it doesn't exist
        os.makedirs("build", exist_ok=True)
        
        # Copy the compiled grammar to the build directory
        grammar_path = os.path.join(temp_dir, f"build/{lang_name}.so")
        if os.path.exists(grammar_path):
            shutil.copy(grammar_path, output_path)
            print(f"Successfully built {lang_name} grammar")
            return True
        else:
            print(f"Could not find compiled grammar at {grammar_path}")
            return False
    finally:
        # Clean up
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

def main():
    grammars = {
        'python': 'https://github.com/tree-sitter/tree-sitter-python',
        'java': 'https://github.com/tree-sitter/tree-sitter-java',
        'javascript': 'https://github.com/tree-sitter/tree-sitter-javascript',
        'typescript': 'https://github.com/tree-sitter/tree-sitter-typescript',
        'cpp': 'https://github.com/tree-sitter/tree-sitter-cpp',
        'go': 'https://github.com/tree-sitter/tree-sitter-go'
    }
    
    # Check if tree-sitter CLI is installed
    if not run_command("tree-sitter --version"):
        print("Please install tree-sitter CLI first:")
        print("npm install -g tree-sitter-cli")
        return
    
    # Build each grammar
    for lang, repo in grammars.items():
        output_path = f"build/{lang}.so"
        if not build_grammar(lang, repo, output_path):
            print(f"Failed to build {lang} grammar")

if __name__ == "__main__":
    main() 