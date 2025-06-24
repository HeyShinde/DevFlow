import * as vscode from 'vscode';
import * as path from 'path';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { callApi, API_BASE_URL, ApiResponse } from './api';
import { getHtmlForWebview } from './ui';

let aiSettings: { openaiKey?: string; openaiModel?: string; openaiTokenLimit?: string } = {};

export class DevFlowSidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'devflow.sidebarView';
    private _view?: vscode.WebviewView;
    
    // Add backend status tracking
    private backendStatus: { status: string; message: string } = { 
        status: 'stopped', 
        message: 'Backend status: Not started' 
    };

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = getHtmlForWebview(webviewView.webview);
        
        // Initialize webview with current backend status
        this.initializeWebviewState();
        
        webviewView.webview.onDidReceiveMessage(
            async message => {
                try {
                    switch (message.type) {
                        case 'webviewReady':
                            // Send current backend status when webview is ready
                            this.sendBackendStatus();
                            break;
                        case 'requestBackendStatus':
                            // Check actual backend status and update
                            await this.checkAndUpdateBackendStatus();
                            break;
                        case 'saveAiSettings':
                            aiSettings = {
                                openaiKey: message.openaiKey,
                                openaiModel: message.openaiModel,
                                openaiTokenLimit: message.openaiTokenLimit
                            };
                            break;
                        case 'index':
                            await this.handleIndex(message.extensions, message.recursive);
                            break;
                        case 'clear':
                            await this.handleClear();
                            break;
                        case 'stats':
                            await this.handleStats(message.debug);
                            break;
                        case 'embeddings':
                            await this.handleEmbeddings();
                            break;
                        case 'health':
                            await this.handleHealth();
                            break;
                        case 'getFiles':
                            await this.handleGetFiles();
                            break;
                        case 'getChunks':
                            await this.handleGetChunks(message.fileId);
                            break;
                        case 'getFeedback':
                            await this.handleGetFeedback(message.chunkId);
                            break;
                        case 'addFeedback':
                            await this.handleAddFeedback(message.chunkId, message.feedbackType, message.comment);
                            break;
                        case 'search':
                            await this.handleSearch(message.text, message.limit || 5);
                            break;
                        case 'answer':
                            await this.handleAnswerWithAiSettings(message.query, message.limit || 5);
                            break;
                        case 'findSimilar':
                            await this.handleFindSimilar(message.code, message.language);
                            break;
                        case 'startBackend':
                            await vscode.commands.executeCommand('devflow.startBackend');
                            break;
                        case 'stopBackend':
                            await vscode.commands.executeCommand('devflow.stopBackend');
                            break;
                    }
                } catch (error) {
                    this.sendMessageToWebview({
                        type: 'error',
                        message: `Error: ${error}`
                    });
                }
            },
            undefined,
            []
        );
    }

    // Initialize webview state when it loads
    private initializeWebviewState() {
        // Add a small delay to ensure webview is fully loaded
        setTimeout(() => {
            this.sendBackendStatus();
        }, 100);
    }

    // Check actual backend status and update UI
    private async checkAndUpdateBackendStatus() {
        try {
            // Try to call health endpoint to check if backend is actually running
            const response = await callApi('/health', {}, 'GET');
            this.updateBackendStatus('healthy', 'Backend is running and healthy');
        } catch (error) {
            // Backend is not responding, update status accordingly
            this.updateBackendStatus('stopped', 'Backend status: Not started');
        }
    }

    // Update backend status and notify webview
    public updateBackendStatus(status: string, message: string) {
        this.backendStatus = { status, message };
        this.sendBackendStatus();
    }

    // Send backend status to webview
    private sendBackendStatus() {
        this.sendMessageToWebview({
            type: 'backendStatus',
            status: this.backendStatus.status,
            message: this.backendStatus.message
        });
    }

    // --- API Handlers ---
    private async handleIndex(extensions?: string[], recursive: boolean = true) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            this.sendMessageToWebview({ type: 'error', message: 'No workspace folder found' });
            return;
        }
        try {
            this.sendMessageToWebview({ type: 'loading', message: 'Indexing repository... This may take a while.' });
            const indexRequest = {
                path: workspaceFolder.uri.fsPath,
                recursive,
                extensions
            };
            const response = await callApi('/index', indexRequest);
            this.sendMessageToWebview({ type: 'indexComplete', data: response.data, message: response.message });
        } catch (error) {
            this.sendMessageToWebview({ type: 'error', message: `Indexing failed: ${error}` });
        }
    }
    
    private async handleClear() {
        try {
            this.sendMessageToWebview({ type: 'loading', message: 'Clearing index...' });
            const response = await callApi('/clear', {});
            this.sendMessageToWebview({ type: 'clearComplete', message: response.message });
        } catch (error) {
            this.sendMessageToWebview({ type: 'error', message: `Clear failed: ${error}` });
        }
    }
    
    private async handleStats(debug: boolean = false) {
        try {
            const response = await callApi('/stats', { debug }, 'GET');
            this.sendMessageToWebview({ type: 'statsResponse', data: response.data, message: response.message });
        } catch (error) {
            this.sendMessageToWebview({ type: 'error', message: `Stats failed: ${error}` });
        }
    }
    
    private async handleEmbeddings() {
        try {
            const response = await callApi('/embeddings', {}, 'GET');
            this.sendMessageToWebview({ type: 'embeddingsResponse', data: response.data, message: response.message });
        } catch (error) {
            this.sendMessageToWebview({ type: 'error', message: `Embeddings failed: ${error}` });
        }
    }
    
    private async handleHealth() {
        try {
            const response = await callApi('/health', {}, 'GET');
            this.sendMessageToWebview({ type: 'healthResponse', data: response.data, message: response.message });
        } catch (error) {
            this.sendMessageToWebview({ type: 'error', message: `Health check failed: ${error}` });
        }
    }
    
    private async handleGetFiles() {
        try {
            const response = await callApi('/files', {}, 'GET');
            this.sendMessageToWebview({ type: 'filesResponse', data: response.data && response.data.files ? response.data.files : [], message: response.message });
        } catch (error) {
            this.sendMessageToWebview({ type: 'error', message: `Get files failed: ${error}` });
        }
    }
    
    private async handleGetChunks(fileId: number) {
        try {
            const response = await callApi(`/chunks?file_id=${fileId}`, {}, 'GET');
            this.sendMessageToWebview({ type: 'chunksResponse', data: response.data && response.data.chunks ? response.data.chunks : [], message: response.message });
        } catch (error) {
            this.sendMessageToWebview({ type: 'error', message: `Get chunks failed: ${error}` });
        }
    }
    
    private async handleGetFeedback(chunkId: string) {
        try {
            const response = await callApi(`/feedback?chunk_id=${chunkId}`, {}, 'GET');
            this.sendMessageToWebview({ type: 'feedbackResponse', data: response.data && response.data.feedback ? response.data.feedback : [], message: response.message });
        } catch (error) {
            this.sendMessageToWebview({ type: 'error', message: `Get feedback failed: ${error}` });
        }
    }
    
    private async handleAddFeedback(chunkId: string, feedbackType: string, comment: string) {
        try {
            const response = await callApi('/feedback', { chunk_id: chunkId, feedback_type: feedbackType, comment });
            this.sendMessageToWebview({ type: 'addFeedbackResponse', data: response.data && response.data.feedback ? response.data.feedback : {}, message: response.message });
        } catch (error) {
            this.sendMessageToWebview({ type: 'error', message: `Add feedback failed: ${error}` });
        }
    }
    
    private async handleSearch(query: string, limit: number = 5) {
        try {
            this.sendMessageToWebview({ type: 'loading', message: 'Searching codebase...' });
            const response = await callApi('/search', { query, limit });
            this.sendMessageToWebview({ type: 'searchResponse', data: response.data && response.data.chunks ? response.data.chunks : [], message: response.message });
        } catch (error) {
            this.sendMessageToWebview({ type: 'error', message: `Search failed: ${error}` });
        }
    }
    
    private async handleAnswerWithAiSettings(query: string, limit: number = 5) {
        try {
            this.sendMessageToWebview({ type: 'loading', message: 'Generating AI answer...' });
            const payload: any = {
                request: { query, limit }
            };
            if (aiSettings.openaiKey) payload.openai_key = aiSettings.openaiKey;
            if (aiSettings.openaiModel) payload.openai_model = aiSettings.openaiModel;
            if (aiSettings.openaiTokenLimit) payload.openai_token_limit = aiSettings.openaiTokenLimit;
            const response = await callApi('/answer', payload);
            this.sendMessageToWebview({
                type: 'answerResponse',
                data: response.data && response.data.answer ? response.data.answer : 'No answer generated',
                message: response.message
            });
        } catch (error) {
            this.sendMessageToWebview({ type: 'error', message: `Answer query failed: ${error}` });
        }
    }
    
    private async handleFindSimilar(code: string, language: string) {
        try {
            this.sendMessageToWebview({ type: 'loading', message: 'Analyzing code...' });
            const response = await callApi('/find_similar', { code_snippet: code, language: language });
            this.sendMessageToWebview({
                type: 'findSimilarResponse',
                data: response.data && response.data.chunks ? response.data.chunks : [],
                message: response.message
            });
        } catch (error) {
            this.sendMessageToWebview({
                type: 'error',
                message: `Explanation failed: ${error}`
            });
        }
    }

    private sendMessageToWebview(message: any) {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
    }

    public setOnDidReceiveMessage(handler: (message: any) => void) {
        if (this._view) {
            this._view.webview.onDidReceiveMessage(handler);
        }
    }
}