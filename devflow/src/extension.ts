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

async function checkBackendHealth(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`${API_BASE_URL}/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.end();
  });
}

async function waitForBackendHealth(
  maxAttempts: number = 30,
  interval: number = 1000
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    if (await checkBackendHealth()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  return false;
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

async function ensureVenvAndDeps(backendDir: string): Promise<void> {
  const venvDir = path.join(backendDir, "venv");
  if (!fs.existsSync(venvDir)) {
    vscode.window.showInformationMessage("Setting up Python environment for DevFlow backend (first run)...");
    // Find python3
    const pythonCmd = process.platform === "win32" ? "python" : "python3";
    await runCommand(pythonCmd, ["-m", "venv", "venv"], { cwd: backendDir });
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
  // Install requirements
  await runCommand(pipPath, ["install", "-r", "requirements.txt"], { cwd: backendDir });
		}

// In your extension.ts, update the startBackend and stopBackend functions:

async function startBackend(context: vscode.ExtensionContext) {
  try {
    if (backendProcess) {
      vscode.window.showInformationMessage("Backend is already running.");
      provider.updateBackendStatus("running", "Backend is already running.");
      return;
    }

    // Show message to user
    vscode.window.showInformationMessage(
      "Starting DevFlow backend. This may take a few seconds (or minutes on first run) as dependencies are installed. Please allow it time to start."
    );
    provider.updateBackendStatus("starting", "Starting DevFlow backend. This may take a few seconds (or minutes on first run) as dependencies are installed.");
			
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

    backendProcess = spawn(uvicornPath, [
      "app.main:app",
      "--host", "127.0.0.1",
      "--port", "8000",
      "--reload"
    ], {
      cwd: backendDir,
      env: {
        ...process.env,
        WORKSPACE_ROOT: workspaceRoot,
      },
      stdio: "pipe"
    });

    backendProcess.stdout.on("data", (data) => {
      console.log(`[Backend] ${data}`);
      provider["sendMessageToWebview"]({
        type: "backendLog",
        logType: "info",
        message: data.toString()
      });
    });

    backendProcess.stderr.on("data", (data) => {
      console.error(`[Backend ERROR] ${data}`);
      provider["sendMessageToWebview"]({
        type: "backendLog",
        logType: "error",
        message: data.toString()
      });
    });

    backendProcess.on("close", (code) => {
      vscode.window.showInformationMessage(`Backend stopped (code ${code})`);
      provider.updateBackendStatus("stopped", `Backend stopped (code ${code})`);
      backendProcess = null;
    });

    // Wait for backend to be healthy
    const isHealthy = await waitForBackendHealth();
    if (isHealthy) {
      vscode.window.showInformationMessage("Backend started and healthy!");
      provider.updateBackendStatus("healthy", "Backend started and healthy!");
    } else {
      throw new Error("Backend failed to start properly");
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to start backend: ${error.message}`);
    provider.updateBackendStatus("error", `Failed to start backend: ${error.message}`);
    if (backendProcess) {
      backendProcess.kill();
      backendProcess = null;
    }
  }
}

async function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
    vscode.window.showInformationMessage("Backend stopped!");
    provider.updateBackendStatus("stopped", "Backend stopped!");
  } else {
    vscode.window.showInformationMessage("Backend is not running.");
    provider.updateBackendStatus("stopped", "Backend is not running.");
  }
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
    backendProcess.kill();
    backendProcess = null;
  }
}

async function sendAnswerRequest(query: string) {
  // ... existing code to build payload ...
  const payload = {
    query,
    openai_key: aiSettings.openaiKey,
    openai_model: aiSettings.openaiModel,
    openai_token_limit: aiSettings.openaiTokenLimit
  };
  // ... send payload to backend ...
}
