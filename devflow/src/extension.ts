import * as vscode from "vscode";
import * as path from "path";
import { spawn, ChildProcessWithoutNullStreams, SpawnOptions } from "child_process";
import { DevFlowSidebarProvider } from "./sidebar/SidebarProvider";
import * as http from "http";
import * as fs from "fs";

const API_BASE_URL = "http://localhost:8000/api";
let provider: DevFlowSidebarProvider;

interface ApiResponse {
	success?: boolean;
	data?: any;
	error?: string;
	message?: string;
}

let backendProcess: ChildProcessWithoutNullStreams | null = null;
let aiSettings: { openaiKey?: string; openaiModel?: string; openaiTokenLimit?: string } = {};

async function checkPythonInstallation(): Promise<string> {
  try {
    const pythonVersions = ["python3", "python"];
    for (const pythonCmd of pythonVersions) {
      try {
        const process = spawn(pythonCmd, ["--version"]);
        await new Promise((resolve, reject) => {
          process.on("exit", (code) => {
            if (code === 0) {
              resolve(null);
            } else {
              reject();
            }
          });
        });
        return pythonCmd;
      } catch (e) {
        continue;
      }
    }
    throw new Error("No Python installation found");
  } catch (error) {
    throw new Error("Python is not installed or not in PATH");
  }
}

// Helper to run a command and return a promise
function runCommand(command: string, args: string[], options: SpawnOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, options);
    if (proc.stdout) proc.stdout.on("data", (data) => console.log(`[Setup] ${data}`));
    if (proc.stderr) proc.stderr.on("data", (data) => console.error(`[Setup ERROR] ${data}`));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
    proc.on("error", reject);
  });
}

// Enhanced ensureVenvAndDeps function with better error handling
async function ensureVenvAndDeps(backendDir: string): Promise<void> {
  const venvDir = path.join(backendDir, "venv");
  
  if (!fs.existsSync(venvDir)) {
    vscode.window.showInformationMessage("Setting up Python environment for DevFlow backend (first run)...");
    provider.updateBackendStatus("starting", "Setting up Python environment (first run)...");
    
    // Find python command
    const pythonCmd = await checkPythonInstallation();
    
    try {
      await runCommand(pythonCmd, ["-m", "venv", "venv"], { cwd: backendDir });
      provider.updateBackendStatus("starting", "Python environment created, installing dependencies...");
    } catch (error) {
      throw new Error(`Failed to create virtual environment: ${error}`);
    }
  }
  
  // Check for pip in venv
  const pipPath = path.join(
    backendDir,
    "venv",
    process.platform === "win32" ? "Scripts" : "bin",
    "pip"
  );
  
  if (!fs.existsSync(pipPath)) {
    throw new Error("pip not found in virtual environment.");
  }
  
  // Check if requirements.txt exists
  const requirementsPath = path.join(backendDir, "requirements.txt");
  if (!fs.existsSync(requirementsPath)) {
    throw new Error("requirements.txt not found in backend directory.");
  }
  
  // Install requirements
  try {
    provider.updateBackendStatus("starting", "Installing Python dependencies...");
    await runCommand(pipPath, ["install", "-r", "requirements.txt"], { cwd: backendDir });
    provider.updateBackendStatus("starting", "Dependencies installed, starting server...");
  } catch (error) {
    throw new Error(`Failed to install dependencies: ${error}`);
  }
}

// Enhanced backend startup with comprehensive debugging and shutdown detection
async function startBackend(context: vscode.ExtensionContext) {
  try {
    // Show message to user
    vscode.window.showInformationMessage(
      "Starting DevFlow backend in a VS Code terminal. Please keep the terminal open for the backend to run."
    );
    provider.updateBackendStatus("starting", "Starting DevFlow backend in terminal...");
    
    const backendDir = path.join(context.extensionPath, "backend");

    // 1. Ensure venv and dependencies
    await ensureVenvAndDeps(backendDir);

    // 2. Prepare to launch backend
    const venvPath = path.join(
      backendDir,
      "venv",
      process.platform === "win32" ? "Scripts" : "bin"
    );
    const uvicornPath = path.join(venvPath, process.platform === "win32" ? "uvicorn.exe" : "uvicorn");

    if (!fs.existsSync(uvicornPath)) {
      throw new Error("Uvicorn not found in backend environment. Setup may have failed.");
    }
    if (!fs.existsSync(path.join(backendDir, "app", "main.py"))) {
      throw new Error("Backend code not found. Please reinstall the extension.");
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    const workspaceRoot = workspaceFolders && workspaceFolders.length > 0
      ? workspaceFolders[0].uri.fsPath
      : undefined;

    if (!workspaceRoot) {
      vscode.window.showErrorMessage("No workspace folder found.");
      provider.updateBackendStatus("error", "No workspace folder found.");
      return;
    }

    // Prepare environment variables for the terminal
    const envVars = {
      ...process.env,
      WORKSPACE_ROOT: workspaceRoot,
      PYTHONPATH: path.join(backendDir, "app"),
      PYTHONUNBUFFERED: "1",
      TOKENIZERS_PARALLELISM: "false"
    };

    // Start backend in VS Code terminal
    const terminal = vscode.window.createTerminal({
      name: "DevFlow Backend",
      cwd: backendDir,
      env: envVars
    });
    terminal.sendText(`${uvicornPath} app.main:app --host 127.0.0.1 --port 8000 --log-level info`);
    terminal.show();

    vscode.window.showInformationMessage("DevFlow backend started in terminal. Please keep the terminal open for DevFlow to work.");
    provider.updateBackendStatus("running", "Backend started in terminal. Please keep the terminal open.");
  } catch (error: any) {
    console.error("Backend startup error:", error);
    vscode.window.showErrorMessage(`Failed to start backend: ${error.message}`);
    provider.updateBackendStatus("error", `Failed to start backend: ${error.message}`);
  }
}

// Enhanced health check with detailed logging and retries
async function waitForBackendHealthWithRetry(): Promise<boolean> {
  console.log("Starting health check sequence...");
  
  // First, wait a bit longer for the server to be fully ready
  for (let i = 0; i < 30; i++) {
    console.log(`Health check attempt ${i + 1}/30`);
    
    // Check if process is still alive first
    if (!backendProcess || backendProcess.killed) {
      console.log("Backend process is dead, stopping health checks");
      return false;
    }
    
    try {
      const isHealthy = await checkBackendHealthDetailed();
      if (isHealthy) {
        console.log("Health check passed!");
        return true;
      }
    } catch (error: any) {
      console.log(`Health check attempt ${i + 1} failed:`, error.message);
    }
    
    // Update status every 5 attempts
    if (i % 5 === 0 && i > 0) {
      provider.updateBackendStatus("starting", `Health check in progress... (${i + 1}/30)`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log("Health check failed after all attempts");
  return false;
}

// More detailed health check
async function checkBackendHealthDetailed(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    console.log(`Attempting health check to ${API_BASE_URL}/health`);
    
    const req = http.get(`${API_BASE_URL}/health`, {
      timeout: 10000 // 10 second timeout
    }, (res) => {
      console.log(`Health check response: ${res.statusCode}`);
      resolve(res.statusCode === 200);
    });
    
    req.on("error", (error) => {
      console.log(`Health check error: ${error.message}`);
      reject(error);
    });
    
    req.on("timeout", () => {
      console.log("Health check timeout");
      req.destroy();
      reject(new Error("Health check timeout"));
    });
    
    req.end();
  });
}

// Improved health check with better error handling (backup function)
async function checkBackendHealth(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`${API_BASE_URL}/health`, {
      timeout: 5000 // 5 second timeout per request
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on("error", (error) => {
      console.log(`Health check error: ${error.message}`);
      resolve(false);
    });
    
    req.on("timeout", () => {
      console.log("Health check timeout");
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Enhanced wait function with better logging (backup function)
async function waitForBackendHealth(
  maxAttempts: number = 60,
  interval: number = 2000
): Promise<boolean> {
  console.log(`Waiting for backend health (${maxAttempts} attempts, ${interval}ms interval)`);
  
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`Health check attempt ${i + 1}/${maxAttempts}`);
    
    if (await checkBackendHealth()) {
      console.log("Backend health check passed!");
      return true;
    }
    
    // Update status every 10 attempts to show progress
    if (i % 10 === 0 && i > 0) {
      provider.updateBackendStatus("starting", `Still starting... (attempt ${i + 1}/${maxAttempts})`);
    }
    
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  
  console.log("Backend health check failed after all attempts");
  return false;
}

// Update stopBackend to just show a message
async function stopBackend() {
  vscode.window.showInformationMessage("To stop the DevFlow backend, please close the 'DevFlow Backend' terminal.");
  provider.updateBackendStatus("stopped", "To stop the backend, close the 'DevFlow Backend' terminal.");
}

function handleWebviewMessage(message: any) {
  switch (message.type) {
    case 'saveAiSettings':
      aiSettings = {
        openaiKey: message.openaiKey,
        openaiModel: message.openaiModel,
        openaiTokenLimit: message.openaiTokenLimit
      };
      vscode.workspace.getConfiguration().update('devflow.aiSettings', aiSettings, vscode.ConfigurationTarget.Global);
      break;
    // ... handle other message types ...
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log("DevFlow extension activated!");

  // Register the webview provider
  provider = new DevFlowSidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      DevFlowSidebarProvider.viewType,
      provider
    )
  );

  // Register commands for quick access
  context.subscriptions.push(
    vscode.commands.registerCommand("devflow.query", async () => {
      const query = await vscode.window.showInputBox({
        prompt: "Ask a question about your codebase",
        placeHolder: "How does authentication work?",
      });
      if (query) {
        // Trigger query through webview
        provider["sendMessageToWebview"]({
          type: "triggerQuery",
          query: query,
        });
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "devflow.findSimilarSelection",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          const selection = editor.selection;
          const selectedText = editor.document.getText(selection);
          if (selectedText) {
            const document = editor.document;
            const language = document.languageId;
            
            // Map VS Code language IDs to your backend's language names
            const languageMap: { [key: string]: string } = {
              python: "python",
              javascript: "javascript",
              typescript: "typescript",
              java: "java",
              go: "go",
              cpp: "cpp",
              c: "c",
              csharp: "csharp",
              rust: "rust",
              php: "php",
            };
            
            const mappedLanguage = languageMap[language] || language;
            
            // Trigger Find Similar through webview
            provider["sendMessageToWebview"]({
              type: "triggerFindSimilar",
              code: selectedText,
              language: mappedLanguage,
            });
          } else {
            vscode.window.showWarningMessage(
              "Please select some code to find similar examples"
            );
          }
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("devflow.indexRepository", async () => {
      const extensions = await vscode.window.showInputBox({
        prompt: "File extensions to index (comma-separated, optional)",
        placeHolder: "py,js,ts",
      });
      
      // Trigger indexing through webview
      provider["sendMessageToWebview"]({
        type: "triggerIndex",
        extensions: extensions
          ? extensions.split(",").map((ext) => ext.trim())
          : null,
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("devflow.getStats", () => {
      provider["sendMessageToWebview"]({
        type: "triggerStats",
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("devflow.startBackend", () =>
      startBackend(context)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("devflow.stopBackend", () => stopBackend())
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("devflow.showGettingStarted", () => {
      provider["sendMessageToWebview"]({
        type: "showGettingStarted"
      });
    })
  );

  provider.setOnDidReceiveMessage(handleWebviewMessage);
}

export function deactivate() {
  if (backendProcess) {
    console.log("Extension deactivating, stopping backend...");
    backendProcess.kill('SIGTERM');
    // Give it a moment to shut down gracefully
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        backendProcess.kill('SIGKILL');
      }
      backendProcess = null;
    }, 3000);
  }
}