const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function runCommand(command, args, options) {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, options);
        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (data) => {
            stdout += data;
            console.log(data.toString());
        });

        proc.stderr.on('data', (data) => {
            stderr += data;
            console.error(data.toString());
        });

        proc.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout, stderr });
            } else {
                reject(new Error(`Command failed with code ${code}\n${stderr}`));
            }
        });
    });
}

async function checkPython() {
    const pythonCommands = ['python3', 'python'];
    
    for (const cmd of pythonCommands) {
        try {
            await runCommand(cmd, ['--version']);
            return cmd;
        } catch (e) {
            continue;
        }
    }
    throw new Error('Python is not installed');
}

async function setupBackend() {
    try {
        console.log('Setting up DevFlow backend...');
        
        // Find Python
        const pythonCmd = await checkPython();
        console.log(`Using Python command: ${pythonCmd}`);
        
        // Get extension root directory
        const extensionRoot = path.resolve(__dirname, '..');
        const backendDir = path.join(extensionRoot, 'backend');
        
        // Create backend directory if it doesn't exist
        if (!fs.existsSync(backendDir)) {
            fs.mkdirSync(backendDir, { recursive: true });
        }
        
        // Create virtual environment
        const venvPath = path.join(backendDir, 'venv');
        if (!fs.existsSync(venvPath)) {
            console.log('Creating virtual environment...');
            await runCommand(pythonCmd, ['-m', 'venv', venvPath]);
        }
        
        // Get path to pip
        const pipPath = path.join(
            venvPath,
            process.platform === 'win32' ? 'Scripts' : 'bin',
            'pip'
        );
        
        // Upgrade pip
        console.log('Upgrading pip...');
        await runCommand(pipPath, ['install', '--upgrade', 'pip']);
        
        // Install requirements
        console.log('Installing Python dependencies...');
        await runCommand(
            pipPath,
            ['install', '-r', path.join(backendDir, 'requirements.txt')]
        );
        
        console.log('Backend setup completed successfully!');
    } catch (error) {
        console.error('Failed to set up backend:', error);
        process.exit(1);
    }
}

setupBackend(); 