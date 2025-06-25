import * as vscode from 'vscode';

export function getHtmlForWebview(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DevFlow Assistant</title>
            <style>
                :root {
                    --border-radius: 8px;
                    --border-radius-small: 4px;
                    --spacing-xs: 4px;
                    --spacing-sm: 8px;
                    --spacing-md: 12px;
                    --spacing-lg: 16px;
                    --spacing-xl: 20px;
                    --spacing-xxl: 24px;
                    --font-size-xs: 10px;
                    --font-size-sm: 12px;
                    --font-size-md: 14px;
                    --font-size-lg: 16px;
                    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
                    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
                    --transition: all 0.2s ease;
                }

                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: var(--vscode-font-family);
                    font-size: var(--font-size-md);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                    padding: var(--spacing-lg);
                    line-height: 1.5;
                    overflow-x: hidden;
                }

                .container {
                    max-width: 100%;
                    margin: 0 auto;
                }

                /* Header */
                .header {
                    display: flex;
                    align-items: center;
                    margin-bottom: var(--spacing-xl);
                    padding-bottom: var(--spacing-lg);
                    border-bottom: 2px solid var(--vscode-widget-border);
                }

                .header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                    background: linear-gradient(135deg, var(--vscode-button-background), var(--vscode-textLink-foreground));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .header .subtitle {
                    margin-left: var(--spacing-md);
                    color: var(--vscode-descriptionForeground);
                    font-size: var(--font-size-sm);
                }

                /* Tabs */
                .tabs {
                    display: flex;
                    background: var(--vscode-tab-unfocusedInactiveBackground);
                    border-radius: var(--border-radius);
                    padding: var(--spacing-xs);
                    margin-bottom: var(--spacing-xl);
                    box-shadow: var(--shadow-sm);
                }

                .tab {
                    flex: 1;
                    padding: var(--spacing-md) var(--spacing-lg);
                    cursor: pointer;
                    background: none;
                    border: none;
                    outline: none;
                    color: var(--vscode-tab-inactiveForeground);
                    font-weight: 500;
                    font-size: var(--font-size-md);
                    border-radius: var(--border-radius-small);
                    transition: var(--transition);
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                .tab::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: var(--vscode-tab-activeBackground);
                    opacity: 0;
                    transition: var(--transition);
                    z-index: -1;
                }

                .tab:hover::before {
                    opacity: 0.5;
                }

                .tab.active {
                    color: var(--vscode-tab-activeForeground);
                    font-weight: 600;
                }

                .tab.active::before {
                    opacity: 1;
                }

                /* Tab Content */
                .tab-content {
                    display: none;
                    animation: fadeIn 0.3s ease;
                }

                .tab-content.active {
                    display: block;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Cards */
                .card {
                    background: var(--vscode-sideBar-background);
                    border: 1px solid var(--vscode-widget-border);
                    border-radius: var(--border-radius);
                    padding: var(--spacing-xl);
                    margin-bottom: var(--spacing-lg);
                    box-shadow: var(--shadow-sm);
                    transition: var(--transition);
                }

                .card:hover {
                    box-shadow: var(--shadow-md);
                }

                .card h3 {
                    margin: 0 0 var(--spacing-lg) 0;
                    font-size: var(--font-size-lg);
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                }

                /* Form Elements */
                .form-group {
                    margin-bottom: var(--spacing-lg);
                }

                .form-row {
                    display: flex;
                    gap: var(--spacing-md);
                    margin-bottom: var(--spacing-md);
                }

                .form-row > * {
                    flex: 1;
                }

                input, textarea, select {
                    width: 100%;
                    padding: var(--spacing-md);
                    border: 1px solid var(--vscode-input-border);
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border-radius: var(--border-radius-small);
                    font-family: var(--vscode-font-family);
                    font-size: var(--font-size-md);
                    transition: var(--transition);
                }

                input:focus, textarea:focus, select:focus {
                    outline: none;
                    border-color: var(--vscode-focusBorder);
                    box-shadow: 0 0 0 2px var(--vscode-focusBorder);
                }

                textarea {
                    resize: vertical;
                    min-height: 80px;
                }

                /* Buttons */
                .btn {
                    padding: var(--spacing-md) var(--spacing-lg);
                    border: none;
                    border-radius: var(--border-radius-small);
                    font-family: var(--vscode-font-family);
                    font-size: var(--font-size-md);
                    font-weight: 500;
                    cursor: pointer;
                    transition: var(--transition);
                    display: inline-flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    text-decoration: none;
                    justify-content: center;
                    min-height: 36px;
                }

                .btn-primary {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }

                .btn-primary:hover:not(:disabled) {
                    background-color: var(--vscode-button-hoverBackground);
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-md);
                }

                .btn-secondary {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    border: 1px solid var(--vscode-widget-border);
                }

                .btn-secondary:hover:not(:disabled) {
                    background-color: var(--vscode-button-secondaryHoverBackground);
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-md);
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none !important;
                    box-shadow: none !important;
                }

                .btn-group {
                    display: flex;
                    gap: var(--spacing-sm);
                    flex-wrap: wrap;
                }

                .btn-group .btn {
                    flex: 1;
                    min-width: 120px;
                }

                /* Response Area */
                .response-area {
                    margin-top: var(--spacing-xl);
                    min-height: 100px;
                }

                .response {
                    background: var(--vscode-textBlockQuote-background);
                    border: 1px solid var(--vscode-widget-border);
                    border-left: 4px solid var(--vscode-textPreformat-foreground);
                    border-radius: var(--border-radius);
                    padding: var(--spacing-lg);
                    animation: slideIn 0.3s ease;
                }

                .response.error {
                    border-left-color: var(--vscode-errorForeground);
                    background-color: var(--vscode-inputValidation-errorBackground);
                    color: var(--vscode-errorForeground);
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                /* Loading State */
                .loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-xxl);
                    color: var(--vscode-descriptionForeground);
                    font-style: italic;
                }

                .loading::before {
                    content: '';
                    width: 20px;
                    height: 20px;
                    border: 2px solid var(--vscode-widget-border);
                    border-top: 2px solid var(--vscode-button-background);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-right: var(--spacing-md);
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* Code Chunks */
                .chunk {
                    background: var(--vscode-editor-inactiveSelectionBackground);
                    border: 1px solid var(--vscode-widget-border);
                    border-radius: var(--border-radius);
                    margin: var(--spacing-md) 0;
                    overflow: hidden;
                    transition: var(--transition);
                }

                .chunk:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }

                .chunk-header {
                    background: var(--vscode-sideBarSectionHeader-background);
                    padding: var(--spacing-md) var(--spacing-lg);
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    border-bottom: 1px solid var(--vscode-widget-border);
                }

                .chunk-meta {
                    padding: var(--spacing-sm) var(--spacing-lg);
                    font-size: var(--font-size-sm);
                    color: var(--vscode-descriptionForeground);
                    background: var(--vscode-badge-background);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                }

                .chunk-code {
                    background: var(--vscode-textCodeBlock-background);
                    padding: var(--spacing-lg);
                    font-family: var(--vscode-editor-font-family);
                    font-size: var(--font-size-sm);
                    white-space: pre-wrap;
                    overflow-x: auto;
                    max-height: 300px;
                    overflow-y: auto;
                }

                /* Statistics */
                .stats {
                    background: var(--vscode-editor-inactiveSelectionBackground);
                    border-radius: var(--border-radius);
                    padding: var(--spacing-lg);
                    margin-top: var(--spacing-lg);
                }

                .stats h4 {
                    margin: 0 0 var(--spacing-lg) 0;
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: var(--spacing-md);
                    margin-bottom: var(--spacing-lg);
                }

                .stats-item {
                    background: var(--vscode-sideBar-background);
                    padding: var(--spacing-md);
                    border-radius: var(--border-radius-small);
                    border: 1px solid var(--vscode-widget-border);
                }

                .stats-item strong {
                    display: block;
                    margin-bottom: var(--spacing-xs);
                    color: var(--vscode-symbolIcon-functionForeground);
                }

                /* Health Status */
                .health-status {
                    display: inline-flex;
                    align-items: center;
                    padding: var(--spacing-xs) var(--spacing-sm);
                    border-radius: 12px;
                    font-size: var(--font-size-xs);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .status-healthy {
                    background-color: var(--vscode-testing-iconPassed);
                    color: white;
                }

                .status-error {
                    background-color: var(--vscode-testing-iconFailed);
                    color: white;
                }

                /* Debug Section */
                .debug-toggle {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    font-size: var(--font-size-sm);
                    color: var(--vscode-descriptionForeground);
                    margin-top: var(--spacing-md);
                }

                .debug-toggle input[type="checkbox"] {
                    width: auto;
                    margin: 0;
                }

                .debug-section {
                    margin-top: var(--spacing-xl);
                    padding-top: var(--spacing-xl);
                    border-top: 1px solid var(--vscode-widget-border);
                }

                .debug-section pre {
                    background: var(--vscode-textCodeBlock-background);
                    padding: var(--spacing-md);
                    border-radius: var(--border-radius-small);
                    overflow-x: auto;
                    font-family: var(--vscode-editor-font-family);
                    font-size: var(--font-size-xs);
                    margin: var(--spacing-sm) 0;
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.6);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }

                .modal {
                    background: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-widget-border);
                    border-radius: var(--border-radius);
                    padding: var(--spacing-xxl);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    min-width: 400px;
                    max-width: 90%;
                    animation: modalIn 0.3s ease;
                }

                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.9) translateY(-20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }

                .modal h3 {
                    margin: 0 0 var(--spacing-md) 0;
                    color: var(--vscode-errorForeground);
                }

                .modal p {
                    margin: 0 0 var(--spacing-xl) 0;
                    color: var(--vscode-descriptionForeground);
                    line-height: 1.6;
                }

                .modal-actions {
                    display: flex;
                    gap: var(--spacing-md);
                    justify-content: flex-end;
                }

                /* Utility Classes */
                .scroll-x {
                    overflow-x: auto;
                    white-space: pre;
                    max-width: 100%;
                    display: inline-block;
                    vertical-align: middle;
                }

                .file-path {
                    display: inline-block;
                    font-family: var(--vscode-editor-font-family);
                    font-size: 12px;
                    background: var(--vscode-textCodeBlock-background);
                    padding: 2px 6px;
                    border-radius: 3px;
                    max-width: 100%;
                    overflow-x: auto;
                    // text-overflow: ellipsis;
                    white-space: pre;
                    vertical-align: middle;
                }

                .extensions-hint {
                    font-size: var(--font-size-sm);
                    color: var(--vscode-descriptionForeground);
                    margin-top: var(--spacing-xs);
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    body {
                        padding: var(--spacing-md);
                    }
                    
                    .tabs {
                        flex-direction: column;
                    }
                    
                    .form-row {
                        flex-direction: column;
                    }
                    
                    .btn-group {
                        flex-direction: column;
                    }
                    
                    .btn-group .btn {
                        min-width: auto;
                    }
                    
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .getting-started {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 32px 16px;
                    background: var(--vscode-editor-inactiveSelectionBackground);
                    border-radius: 10px;
                    box-shadow: 0 2px 16px #0001;
                    margin: 32px auto 24px auto;
                    max-width: 420px;
                }
                .getting-started h2 {
                    margin-top: 0;
                    font-size: 1.6em;
                    color: var(--vscode-button-background);
                }
                .getting-started ul {
                    padding-left: 1.2em;
                    margin: 18px 0 18px 0;
                }
                .getting-started li {
                    margin-bottom: 10px;
                    font-size: 1.08em;
                }
                .getting-started .cta-btn {
                    margin-top: 18px;
                    padding: 10px 28px;
                    font-size: 1.1em;
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: background 0.2s;
                }
                .getting-started .cta-btn:hover {
                    background: var(--vscode-button-hoverBackground);
                }
                .getting-started .icon {
                    font-size: 2.2em;
                    margin-bottom: 10px;
                }

                .backend-controls {
                    margin-top: var(--spacing-xl);
                    display: flex;
                    gap: var(--spacing-md);
                }

                /* Backend Status */
                .backend-status {
                    margin-bottom: var(--spacing-lg);
                    padding: var(--spacing-md);
                    border-radius: var(--border-radius);
                    font-size: var(--font-size-sm);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                }

                .backend-status.running { background: var(--vscode-testing-runningBackground); }
                .backend-status.healthy { background: var(--vscode-testing-passedBackground); }
                .backend-status.error { background: var(--vscode-testing-errorBackground); }
                .backend-status.stopped { background: var(--vscode-testing-skippedBackground); }

                /* Backend Logs */
                .backend-logs {
                    margin-top: var(--spacing-lg);
                    border: 1px solid var(--vscode-widget-border);
                    border-radius: var(--border-radius);
                    max-height: 200px;
                    overflow-y: auto;
                }

                .log-entry {
                    padding: var(--spacing-sm) var(--spacing-md);
                    font-family: var(--vscode-editor-font-family);
                    font-size: var(--font-size-sm);
                    border-bottom: 1px solid var(--vscode-widget-border);
                }

                .log-entry:last-child {
                    border-bottom: none;
                }

                .log-entry.error {
                    color: var(--vscode-testing-error);
                }

                .log-entry.info {
                    color: var(--vscode-testing-info);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div id="gettingStarted" class="getting-started">
                    <div class="icon">🚀</div>
                    <h2>Welcome to DevFlow!</h2>
                    <p>Supercharge your code workflow with AI-powered search, code understanding, and repository insights.</p>
                    <ul>
                        <li>🔍 <b>Search</b> your codebase with natural language or keywords</li>
                        <li>🤖 <b>AI Answers</b> to code questions using context</li>
                        <li>🔎 <b>Find Similar</b> code snippets and patterns</li>
                        <li>📊 <b>Repository Stats</b> and management tools</li>
                    </ul>
                    <button class="cta-btn" onclick="hideGettingStarted()">Get Started</button>
                </div>
                <div id="mainContent" style="display:none;">
                    <div class="header">
                        <h1>DevFlow</h1>
                        <span class="subtitle">AI-Powered Code Assistant</span>
                    </div>
                    <div class="backend-controls" style="display: flex; gap: 8px; margin-bottom: 16px;">
                        <button id="startBackendBtn" class="btn btn-primary">Start Backend</button>
                        <button id="stopBackendBtn" class="btn btn-secondary">Stop Backend</button>
                    </div>

                    <div class="backend-status" id="backendStatus">
                        Backend status: Not started
                    </div>

                    <div class="tabs">
                        <button class="tab active" id="tab-repo" onclick="switchTab('repo')">📁 Repository</button>
                        <button class="tab" id="tab-search" onclick="switchTab('search')">💬 Search</button>
                        <button class="tab" id="tab-find-similar" onclick="switchTab('find-similar')">🔎 Find Similar</button>
                        <button class="tab" id="tab-ai-settings" onclick="switchTab('ai-settings')">⚙️ AI Settings</button>
                    </div>

                    <div id="content-repo" class="tab-content active">
                        <div class="card">
                            <h3>📁 Repository Management</h3>
                            <div class="form-group">
                                <input type="text" id="extensionsInput" 
                                    placeholder="Extensions: py,js,ts (optional)">
                                <div class="extensions-hint">
                                    Specify file extensions to index (comma-separated). Leave empty for all files.
                                </div>
                            </div>
                            <div class="form-row">
                                <label class="debug-toggle">
                                    <input type="checkbox" id="recursiveCheck" checked> 
                                    Include subdirectories
                                </label>
                            </div>
                            <div class="btn-group">
                                <button class="btn btn-primary" onclick="indexRepository()">
                                    📚 Index Repository
                                </button>
                                <button class="btn btn-secondary" onclick="getStats()">
                                    📊 Get Stats
                                </button>
                            </div>
                            <div class="btn-group">
                                <button class="btn btn-secondary" onclick="clearIndex()">
                                    🗑️ Clear Index
                                </button>
                                <button class="btn btn-secondary" onclick="checkHealth()">
                                    ❤️ Health Check
                                </button>
                            </div>
                            <div class="debug-toggle">
                                <input type="checkbox" id="debugMode"> 
                                Show debug information
                            </div>
                        </div>
                    </div>

                    <div id="content-search" class="tab-content">
                        <div class="card">
                            <h3>💬 Search Codebase</h3>
                            <div class="form-group">
                                <textarea id="queryInput" 
                                    placeholder="Ask questions about your code: 'How does authentication work?' or 'Show me database functions'" 
                                    rows="3"></textarea>
                            </div>
                            <div class="form-row">
                                <input type="number" id="queryLimit" 
                                    placeholder="Results (default: 5)" 
                                    min="1" max="20" value="5">
                            </div>
                            <div class="btn-group">
                                <button class="btn btn-primary" onclick="sendSearch()">
                                    🔍 Search
                                </button>
                                <button class="btn btn-secondary" onclick="sendAnswer()">
                                    🤖 AI Answer
                                </button>
                            </div>
                        </div>
                        <div id="response-search" class="response-area"></div>
                    </div>

                    <div id="content-find-similar" class="tab-content">
                        <div class="card">
                            <h3>🔎 Find Similar Code</h3>
                            <div class="form-group">
                                <textarea id="codeInput" 
                                    placeholder="Paste code snippet to find similar examples..." 
                                    rows="6"></textarea>
                            </div>
                            <div class="form-group">
                                <select id="languageSelect">
                                    <option value="python">Python</option>
                                    <option value="javascript">JavaScript</option>
                                    <option value="typescript">TypeScript</option>
                                    <option value="java">Java</option>
                                    <option value="go">Go</option>
                                    <option value="cpp">C++</option>
                                    <option value="csharp">C#</option>
                                    <option value="rust">Rust</option>
                                    <option value="php">PHP</option>
                                </select>
                            </div>
                            <div class="btn-group">
                                <button class="btn btn-primary" onclick="findSimilarCode()">
                                    🔍 Find Similar
                                </button>
                            </div>
                        </div>
                        <div id="response-find-similar" class="response-area"></div>
                    </div>

                    <div id="content-ai-settings" class="tab-content">
                        <div class="card">
                            <h3>AI Settings</h3>
                            <div class="form-group">
                                <label for="openaiKey">OpenAI API Key</label>
                                <input type="password" id="openaiKey" placeholder="sk-..." autocomplete="off" />
                            </div>
                            <div class="form-group">
                                <label for="openaiModel">Model</label>
                                <input type="text" id="openaiModel" value="gpt-4.1-nano" />
                            </div>
                            <div class="form-group">
                                <label for="openaiTokenLimit">Token Limit</label>
                                <input type="number" id="openaiTokenLimit" value="2048" min="256" max="32768" />
                            </div>
                            <button class="btn btn-primary" id="saveAiSettingsBtn">Save AI Settings</button>
                            <span id="aiSettingsSavedMsg" style="display:none; color: var(--vscode-testing-passed); margin-left: 12px;">Saved!</span>
                        </div>
                    </div>
                </div>
            </div>

            <div id="clearConfirmModal" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.3); z-index:1000; align-items:center; justify-content:center;">
                <div style="background:var(--vscode-editor-background); color:var(--vscode-foreground); padding:24px; border-radius:8px; box-shadow:0 2px 16px #0003; min-width:240px; max-width:95vw; width:340px; text-align:center; overflow:auto;">
                    <h3>⚠️ Confirm Action</h3>
                    <p>This will permanently clear the entire index. This action cannot be undone.</p>
                    <button id="confirmClearBtn" class="btn btn-primary" style="margin-right:12px;">Yes, Clear</button>
                    <button id="cancelClearBtn" class="btn btn-secondary">Cancel</button>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();

                function switchTab(tab) {
                    document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(div => div.classList.remove('active'));
                    document.getElementById('tab-' + tab).classList.add('active');
                    document.getElementById('content-' + tab).classList.add('active');
                }

                function sendSearch() {
                    const query = document.getElementById('queryInput').value;
                    const limit = parseInt(document.getElementById('queryLimit').value) || 5;
                    if (query.trim()) {
                        vscode.postMessage({
                            type: 'search',
                            text: query,
                            limit: limit
                        });
                        showLoading('response-search', 'Searching codebase...');
                    }
                }

                function sendAnswer() {
                    const query = document.getElementById('queryInput').value;
                    const limit = parseInt(document.getElementById('queryLimit').value) || 5;
                    if (query.trim()) {
                        vscode.postMessage({
                            type: 'answer',
                            query: query,
                            limit: limit
                        });
                        showLoading('response-search', 'Generating AI answer...');
                    }
                }

                function findSimilarCode() {
                    const code = document.getElementById('codeInput').value;
                    const language = document.getElementById('languageSelect').value;
                    if (code.trim()) {
                        vscode.postMessage({
                            type: 'findSimilar',
                            code: code,
                            language: language
                        });
                        showLoading('response-find-similar', 'Finding similar code...');
                    }
                }

                function indexRepository() {
                    const extensionsInput = document.getElementById('extensionsInput').value;
                    const recursive = document.getElementById('recursiveCheck').checked;
                    const extensions = extensionsInput.trim() ? 
                        extensionsInput.split(',').map(ext => ext.trim()) : null;
                    vscode.postMessage({
                        type: 'index',
                        extensions: extensions,
                        recursive: recursive
                    });
                    showLoading('response-repo', 'Indexing repository... This may take a while.');
                }

                function getStats() {
                    const debug = document.getElementById('debugMode').checked;
                    vscode.postMessage({ 
                        type: 'stats',
                        debug: debug 
                    });
                    showLoading('response-repo', 'Getting statistics...');
                }

                function clearIndex() {
                    document.getElementById('clearConfirmModal').style.display = 'flex';
                }

                function checkHealth() {
                    vscode.postMessage({ type: 'health' });
                    showLoading('response-repo', 'Checking backend health...');
                }

                function showLoading(responseId, message) {
                    document.getElementById(responseId).innerHTML = 
                        '<div class="loading">' + message + '</div>';
                }

                function showResponse(responseId, content, isError = false) {
                    const className = isError ? 'stats error' : 'stats';
                    document.getElementById(responseId).innerHTML =
                        '<div class="' + className + '"><div class="stats-item">' + content + '</div></div>';
                }

                function renderChunks(responseId, chunks, title = 'Results') {
                    let html = '<div class="stats"><h4>' + title + '</h4>';
                    if (!chunks || chunks.length === 0) {
                        html += '<div class="stats-item">No results found. Make sure your repository is indexed.</div>';
                        html += '</div>';
                        document.getElementById(responseId).innerHTML = html;
                        return;
                    }
                    chunks.forEach(chunk => {
                        html += '<div class="stats-item">';
                        html += '<div class="chunk-header">' +
                            (chunk.type === 'function' ? '⚡' : chunk.type === 'class' ? '🏗️' : '📄') +
                            ' <b>' + (chunk.name || '(Unnamed)') + '</b></div>';
                        html += '<div class="chunk-meta">📁 <span class="scroll-x file-path">' + (chunk.file_path || 'Unknown file') + '</span>' +
                            (chunk.score !== undefined ? ' | Score: ' + chunk.score.toFixed(3) : '') + '</div>';
                        html += '<div class="chunk-code">' + (chunk.text || '') + '</div>';
                        html += '</div>';
                    });
                    html += '</div>';
                    document.getElementById(responseId).innerHTML = html;
                }

                function showStats(responseId, stats) {
                    let html = '<div class="stats"><h4>📊 Repository Statistics</h4>';
                    // File/chunk stats from metadata
                    html += '<div class="stats-item"><strong>Files (metadata):</strong> ' + stats.file_count + '</div>';
                    html += '<div class="stats-item"><strong>Chunks (metadata):</strong> ' + stats.chunk_count + '</div>';
                    // Vector/embedding stats from ChromaDB
                    html += '<div class="stats-item"><strong>Vectors (ChromaDB):</strong> ' + stats.vector_count + '</div>';
                    html += '<div class="stats-item"><strong>Embedding Dimensions:</strong> ' + stats.embedding_dimensions + '</div>';
                    html += '<div class="stats-item"><strong>Languages (ChromaDB):</strong> ' + (Array.isArray(stats.vector_languages) ? stats.vector_languages.join(', ') : 'N/A') + '</div>';
                    if (stats.vector_sample_files && stats.vector_sample_files.length > 0) {
                        html += '<div class="stats-item"><strong>Sample Files (ChromaDB):</strong><div class="scroll-x">';
                        html += stats.vector_sample_files.map(file => '<span class="file-path">' + file + '</span>').join(', ');
                        html += '</div></div>';
                    }
                    // Show warning if mismatch
                    if ((stats.file_count > 0 && stats.vector_count === 0) || (stats.chunk_count !== stats.vector_count)) {
                        html += '<div class="stats-item error"><strong>⚠️ Index Mismatch:</strong> ';
                        if (stats.file_count > 0 && stats.vector_count === 0) {
                            html += 'Files are indexed in metadata but no vectors found in ChromaDB. Try re-indexing.';
                        } else if (stats.chunk_count !== stats.vector_count) {
                            html += 'Mismatch between chunk count and vector count. Index may be incomplete or corrupted.';
                        }
                        html += '</div>';
                    }
                    // Show errors/warnings if any
                    if (stats.errors && stats.errors.length > 0) {
                        html += '<div class="stats-item error"><strong>Warnings/Errors:</strong><ul>';
                        stats.errors.forEach(error => {
                            html += '<li>' + error + '</li>';
                        });
                        html += '</ul></div>';
                    }
                    // Show debug info if present
                    if (stats.vector_debug && (stats.vector_debug.ids || stats.vector_debug.sample_metadata)) {
                        html += '<div class="stats-item"><strong>Debug Info:</strong>';
                        if (stats.vector_debug.ids && stats.vector_debug.ids.length > 0) {
                            html += '<div><b>Chunk IDs:</b><div class="scroll-x">' + stats.vector_debug.ids.map(id => '<span class="file-path">' + id + '</span>').join('<br>') + '</div></div>';
                        }
                        if (stats.vector_debug.sample_metadata && stats.vector_debug.sample_metadata.length > 0) {
                            html += '<div><b>Sample Metadata:</b><div class="scroll-x">';
                            stats.vector_debug.sample_metadata.forEach(md => {
                                html += '<pre>' + JSON.stringify(md, null, 2) + '</pre>';
                            });
                            html += '</div></div>';
                        }
                        html += '</div>';
                    }
                    html += '</div>';
                    document.getElementById(responseId).innerHTML = html;
                }

                function showHealth(responseId, health) {
                    let html = '<div class="stats"><h4>❤️ Backend Health</h4>';
                    // Format timestamp
                    let timestamp = health.timestamp;
                    if (timestamp) {
                        try {
                            const d = new Date(timestamp);
                            timestamp = d.toLocaleString(undefined, {
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                            });
                        } catch (e) { /* fallback to raw */ }
                    } else {
                        timestamp = 'N/A';
                    }
                    // Status badge
                    let statusHtml = '';
                    if (health.status && health.status.toLowerCase() === 'healthy') {
                        statusHtml = '<span class="health-status status-healthy">HEALTHY</span>';
                    } else {
                        statusHtml = '<span class="health-status status-error">ERROR</span>';
                    }
                    html += '<div class="stats-item"><strong>Status:</strong> ' + statusHtml + '</div>';
                    html += '<div class="stats-item"><strong>Timestamp:</strong> ' + timestamp + '</div>';
                    if (health.details) {
                        html += '<div class="stats-item"><strong>Details:</strong> <pre>' + JSON.stringify(health.details, null, 2) + '</pre></div>';
                    }
                    html += '</div>';
                    document.getElementById(responseId).innerHTML = html;
                }

                // Message handler
                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.type) {
                        case 'searchResponse':
                            renderChunks('response-search', message.data, '🔍 Search Results');
                            break;
                        case 'findSimilarResponse':
                            renderChunks('response-find-similar', message.data, '🔎 Similar Code Examples');
                            break;
                        case 'answerResponse':
                            showResponse('response-search', '<b>AI Answer:</b><br>' + message.data);
                            break;
                        case 'indexComplete':
                            showResponse('response-repo', '<h4>✅ Indexing Complete</h4><p>' + message.message + '</p>');
                            break;
                        case 'clearComplete':
                            showResponse('response-repo', '<h4>🗑️ Index Cleared</h4><p>' + message.message + '</p>');
                            break;
                        case 'statsResponse':
                            showStats('response-repo', message.data);
                            break;
                        case 'healthResponse':
                            showHealth('response-repo', message.data);
                            break;
                        case 'embeddingsResponse':
                            showResponse('response-repo', '<h4>🔢 Embeddings Data</h4><pre>' + JSON.stringify(message.data, null, 2) + '</pre>');
                            break;
                        case 'filesResponse':
                            showResponse('response-repo', '<b>Files:</b> ' + JSON.stringify(message.data));
                            break;
                        case 'chunksResponse':
                            showResponse('response-repo', '<b>Chunks:</b> ' + JSON.stringify(message.data));
                            break;
                        case 'feedbackResponse':
                            showResponse('response-repo', '<b>Feedback:</b> ' + JSON.stringify(message.data));
                            break;
                        case 'addFeedbackResponse':
                            showResponse('response-repo', '<b>Feedback Added:</b> ' + JSON.stringify(message.data));
                            break;
                        case 'error':
                            const activeTab = document.querySelector('.tab.active').id;
                            const errorResponseId = activeTab === 'tab-search' ? 'response-search' : 
                                                  activeTab === 'tab-find-similar' ? 'response-find-similar' : 
                                                  'response-repo';
                            showResponse(errorResponseId, '<h4>❌ Error</h4><p>' + message.message + '</p>', true);
                            break;
                        case 'backendState':
                            const startBtn = document.getElementById('startBackendBtn');
                            const stopBtn = document.getElementById('stopBackendBtn');
                            let backendRunning = message.running;
                            updateBackendButtons(startBtn, stopBtn, backendRunning);
                            break;
                        case 'backendStatus':
                            const backendStatus = document.getElementById('backendStatus');
                            backendStatus.className = 'backend-status ' + message.status;
                            backendStatus.textContent = message.message;
                            break;
                        case 'showGettingStarted':
                            localStorage.removeItem('devflowGetStartedDismissed');
                            document.getElementById('gettingStarted').style.display = '';
                            document.getElementById('mainContent').style.display = 'none';
                            break;
                    }
                });

                // Modal event handlers
                document.getElementById('confirmClearBtn').onclick = function() {
                    vscode.postMessage({ type: 'clear' });
                    document.getElementById('clearConfirmModal').style.display = 'none';
                    showLoading('response-repo', 'Clearing index...');
                };

                document.getElementById('cancelClearBtn').onclick = function() {
                    document.getElementById('clearConfirmModal').style.display = 'none';
                };

                // Close modal on overlay click
                document.getElementById('clearConfirmModal').onclick = function(e) {
                    if (e.target === this) {
                        this.style.display = 'none';
                    }
                };

                // Keyboard shortcuts
                document.addEventListener('keydown', function(e) {
                    // Ctrl/Cmd + Enter to search
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        const activeTab = document.querySelector('.tab.active').id;
                        switch (activeTab) {
                            case 'tab-search':
                                if (document.getElementById('queryInput').value.trim()) {
                                    sendSearch();
                                }
                                break;
                            case 'tab-find-similar':
                                if (document.getElementById('codeInput').value.trim()) {
                                    findSimilarCode();
                                }
                                break;
                        }
                    }
                    
                    // Tab navigation (Ctrl/Cmd + 1/2/3)
                    if ((e.ctrlKey || e.metaKey) && ['1', '2', '3'].includes(e.key)) {
                        e.preventDefault();
                        const tabs = ['search', 'find-similar', 'repo'];
                        switchTab(tabs[parseInt(e.key) - 1]);
                    }
                    
                    // Escape to close modal
                    if (e.key === 'Escape') {
                        document.getElementById('clearConfirmModal').style.display = 'none';
                    }
                });

                // Auto-resize textareas
                document.querySelectorAll('textarea').forEach(textarea => {
                    textarea.addEventListener('input', function() {
                        this.style.height = 'auto';
                        this.style.height = Math.min(this.scrollHeight, 200) + 'px';
                    });
                });

                // Focus first input when tab changes
                function switchTab(tab) {
                    document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(div => div.classList.remove('active'));
                    document.getElementById('tab-' + tab).classList.add('active');
                    document.getElementById('content-' + tab).classList.add('active');
                    
                    // Focus appropriate input
                    setTimeout(() => {
                        switch (tab) {
                            case 'search':
                                document.getElementById('queryInput').focus();
                                break;
                            case 'find-similar':
                                document.getElementById('codeInput').focus();
                                break;
                        }
                    }, 100);
                }

                // Initialize
                document.addEventListener('DOMContentLoaded', function() {
                    // Focus search input by default
                    document.getElementById('queryInput').focus();

                    // Request current backend status when webview loads
                    vscode.postMessage({
                        type: 'requestBackendStatus'
                    });
    
                    // Also notify that webview is ready
                    vscode.postMessage({
                        type: 'webviewReady'
                    });
                });

                function hideGettingStarted() {
                    localStorage.setItem('devflowGetStartedDismissed', '1');
                    document.getElementById('gettingStarted').style.display = 'none';
                    document.getElementById('mainContent').style.display = '';
                }

                // Show main content on any tab click or action
                document.addEventListener('DOMContentLoaded', function() {
                    // Check if get started was dismissed
                    if (localStorage.getItem('devflowGetStartedDismissed') === '1') {
                        document.getElementById('gettingStarted').style.display = 'none';
                        document.getElementById('mainContent').style.display = '';
                    }
                    // If user interacts with any tab, hide getting started
                    document.querySelectorAll('.tab').forEach(tab => {
                        tab.addEventListener('click', hideGettingStarted);
                    });
                    // Also hide on any form action
                    document.querySelectorAll('button,textarea,input,select').forEach(el => {
                        el.addEventListener('focus', hideGettingStarted);
                    });
                });

                function updateBackendButtons(startBtn, stopBtn, backendRunning) {
                    if (backendRunning) {
                        startBtn.disabled = true;
                        stopBtn.disabled = false;
                    } else {
                        startBtn.disabled = false;
                        stopBtn.disabled = true;
                    }
                }

                function startBackend() {
                    vscode.postMessage({ type: 'startBackend' });
                }

                function stopBackend() {
                    vscode.postMessage({ type: 'stopBackend' });
                }

                window.addEventListener('DOMContentLoaded', function() {
                    const startBtn = document.getElementById('startBackendBtn');
                    const stopBtn = document.getElementById('stopBackendBtn');
                    if (startBtn) {
                        startBtn.onclick = function() {
                            console.log('Start Backend button clicked');
                            vscode.postMessage({ type: 'startBackend' });
                        };
                    }
                    if (stopBtn) {
                        stopBtn.onclick = function() {
                            console.log('Stop Backend button clicked');
                            vscode.postMessage({ type: 'stopBackend' });
                        };
                    }
                });

                // AI Settings logic
                function loadAiSettings() {
                    const key = localStorage.getItem('openaiKey') || '';
                    const model = localStorage.getItem('openaiModel') || 'gpt-4.1-nano';
                    const tokenLimit = localStorage.getItem('openaiTokenLimit') || '2048';
                    document.getElementById('openaiKey').value = key;
                    document.getElementById('openaiModel').value = model;
                    document.getElementById('openaiTokenLimit').value = tokenLimit;
                }
                function saveAiSettings() {
                    const key = document.getElementById('openaiKey').value.trim();
                    const model = document.getElementById('openaiModel').value.trim();
                    const tokenLimit = document.getElementById('openaiTokenLimit').value.trim();
                    localStorage.setItem('openaiKey', key);
                    localStorage.setItem('openaiModel', model);
                    localStorage.setItem('openaiTokenLimit', tokenLimit);
                    vscode.postMessage({
                        type: 'saveAiSettings',
                        openaiKey: key,
                        openaiModel: model,
                        openaiTokenLimit: tokenLimit
                    });
                    document.getElementById('aiSettingsSavedMsg').style.display = 'inline';
                    setTimeout(() => {
                        document.getElementById('aiSettingsSavedMsg').style.display = 'none';
                    }, 1500);
                }
                document.getElementById('saveAiSettingsBtn').addEventListener('click', saveAiSettings);
                window.addEventListener('DOMContentLoaded', loadAiSettings);
            </script>
        </body>
        </html>`;
}