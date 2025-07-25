"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.findProjectRoot = findProjectRoot;
exports.findRuntimesDir = findRuntimesDir;
exports.findServersDir = findServersDir;
exports.projectNameFromGenkitFilePath = projectNameFromGenkitFilePath;
exports.detectRuntime = detectRuntime;
exports.checkServerHealth = checkServerHealth;
exports.waitUntilHealthy = waitUntilHealthy;
exports.waitUntilUnresponsive = waitUntilUnresponsive;
exports.retriable = retriable;
exports.isValidDevToolsInfo = isValidDevToolsInfo;
exports.writeToolsInfoFile = writeToolsInfoFile;
exports.removeToolsInfoFile = removeToolsInfoFile;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const errors_1 = require("./errors");
const logger_1 = require("./logger");
async function findProjectRoot() {
    let currentDir = process.cwd();
    while (currentDir !== path.parse(currentDir).root) {
        const packageJsonPath = path.join(currentDir, 'package.json');
        const goModPath = path.join(currentDir, 'go.mod');
        const pyprojectPath = path.join(currentDir, 'pyproject.toml');
        const pyproject2Path = path.join(currentDir, 'requirements.txt');
        try {
            const [packageJsonExists, goModExists, pyprojectExists, pyproject2Exists,] = await Promise.all([
                fs
                    .access(packageJsonPath)
                    .then(() => true)
                    .catch(() => false),
                fs
                    .access(goModPath)
                    .then(() => true)
                    .catch(() => false),
                fs
                    .access(pyprojectPath)
                    .then(() => true)
                    .catch(() => false),
                fs
                    .access(pyproject2Path)
                    .then(() => true)
                    .catch(() => false),
            ]);
            if (packageJsonExists ||
                goModExists ||
                pyprojectExists ||
                pyproject2Exists) {
                return currentDir;
            }
        }
        catch {
        }
        currentDir = path.dirname(currentDir);
    }
    return process.cwd();
}
async function findRuntimesDir(projectRoot) {
    return path.join(projectRoot, '.genkit', 'runtimes');
}
async function findServersDir(projectRoot) {
    return path.join(projectRoot, '.genkit', 'servers');
}
function projectNameFromGenkitFilePath(filePath) {
    const parts = filePath.split('/');
    const basePath = parts
        .slice(0, Math.max(parts.findIndex((value) => value === '.genkit'), 0))
        .join('/');
    return basePath === '' ? 'unknown' : path.basename(basePath);
}
async function detectRuntime(directory) {
    const files = await fs.readdir(directory);
    for (const file of files) {
        const filePath = path.join(directory, file);
        const stat = await fs.stat(filePath);
        if (stat.isFile() && (path.extname(file) === '.go' || file === 'go.mod')) {
            return 'go';
        }
    }
    try {
        await fs.access(path.join(directory, 'package.json'));
        return 'nodejs';
    }
    catch {
        return undefined;
    }
}
async function checkServerHealth(url) {
    try {
        const response = await fetch(`${url}/api/__health`);
        return response.status === 200;
    }
    catch (error) {
        if ((0, errors_1.isConnectionRefusedError)(error)) {
            return false;
        }
    }
    return true;
}
async function waitUntilHealthy(url, maxTimeout = 10000) {
    const startTime = Date.now();
    while (Date.now() - startTime < maxTimeout) {
        try {
            const response = await fetch(`${url}/api/__health`);
            if (response.status === 200) {
                return true;
            }
        }
        catch (error) {
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return false;
}
async function waitUntilUnresponsive(url, maxTimeout = 10000) {
    const startTime = Date.now();
    while (Date.now() - startTime < maxTimeout) {
        try {
            const health = await fetch(`${url}/api/__health`);
        }
        catch (error) {
            if ((0, errors_1.isConnectionRefusedError)(error)) {
                return true;
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return false;
}
async function retriable(fn, opts) {
    const maxRetries = opts.maxRetries ?? 3;
    const delayMs = opts.delayMs ?? 0;
    let attempt = 0;
    while (true) {
        try {
            return await fn();
        }
        catch (e) {
            if (attempt >= maxRetries - 1) {
                throw e;
            }
            if (delayMs > 0) {
                await new Promise((r) => setTimeout(r, delayMs));
            }
        }
        attempt++;
    }
}
function isValidDevToolsInfo(data) {
    return (typeof data === 'object' &&
        typeof data.url === 'string' &&
        typeof data.timestamp === 'string');
}
async function writeToolsInfoFile(url, projectRoot) {
    const serversDir = await findServersDir(projectRoot);
    const toolsJsonPath = path.join(serversDir, `tools-${process.pid}.json`);
    try {
        const serverInfo = {
            url,
            timestamp: new Date().toISOString(),
        };
        await fs.mkdir(serversDir, { recursive: true });
        await fs.writeFile(toolsJsonPath, JSON.stringify(serverInfo, null, 2));
        logger_1.logger.debug(`Tools Info file written: ${toolsJsonPath}`);
    }
    catch (error) {
        logger_1.logger.error('Error writing tools config', error);
    }
}
async function removeToolsInfoFile(fileName, projectRoot) {
    try {
        const serversDir = await findServersDir(projectRoot);
        const filePath = path.join(serversDir, fileName);
        await fs.unlink(filePath);
        logger_1.logger.debug(`Removed unhealthy toolsInfo file ${fileName} from manager.`);
    }
    catch (error) {
        logger_1.logger.debug(`Failed to delete toolsInfo file: ${error}`);
    }
}
//# sourceMappingURL=utils.js.map