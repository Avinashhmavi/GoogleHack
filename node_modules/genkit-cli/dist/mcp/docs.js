"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineDocsTool = defineDocsTool;
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_stream_1 = require("node:stream");
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const zod_1 = __importDefault(require("zod"));
const version_1 = require("../utils/version");
const DOCS_URL = process.env.GENKIT_DOCS_BUNDLE_URL ??
    'http://genkit.dev/docs-bundle-experimental.json';
const DOCS_BUNDLE_FILE_PATH = path_1.default.resolve(os_1.default.homedir(), '.genkit', 'docs', version_1.version, 'bundle.json');
async function maybeDownloadDocsBundle() {
    if ((0, node_fs_1.existsSync)(DOCS_BUNDLE_FILE_PATH)) {
        return;
    }
    const response = await fetch(DOCS_URL);
    if (response.status !== 200) {
        throw new Error('Failed to download genkit docs bundle. Try again later or/and report the issue.\n\n' +
            DOCS_URL);
    }
    const stream = node_stream_1.Readable.fromWeb(response.body);
    (0, node_fs_1.mkdirSync)(path_1.default.dirname(DOCS_BUNDLE_FILE_PATH), { recursive: true });
    await (0, promises_1.writeFile)(DOCS_BUNDLE_FILE_PATH + '.pending', stream);
    (0, node_fs_1.renameSync)(DOCS_BUNDLE_FILE_PATH + '.pending', DOCS_BUNDLE_FILE_PATH);
}
async function defineDocsTool(server) {
    await maybeDownloadDocsBundle();
    const documents = JSON.parse((0, node_fs_1.readFileSync)(DOCS_BUNDLE_FILE_PATH, { encoding: 'utf8' }));
    server.registerTool('lookup_genkit_docs', {
        title: 'Genkit Docs',
        description: 'Use this to look up documentation for the Genkit AI framework.',
        inputSchema: {
            language: zod_1.default
                .enum(['js', 'go', 'python'])
                .describe('which language these docs are for (default js).')
                .default('js'),
            files: zod_1.default
                .array(zod_1.default.string())
                .describe('Specific docs files to look up. If empty or not specified an index will be returned. Always lookup index first for exact file names.')
                .optional(),
        },
    }, async ({ language, files }) => {
        const content = [];
        if (!language) {
            language = 'js';
        }
        if (!files || !files.length) {
            content.push({
                type: 'text',
                text: Object.keys(documents)
                    .filter((file) => file.startsWith(language))
                    .map((file) => {
                    let fileSummary = ` - File: ${file}\n   Title: ${documents[file].title}\n`;
                    if (documents[file].description) {
                        fileSummary += `   Description: ${documents[file].description}\n`;
                    }
                    if (documents[file].headers) {
                        fileSummary += `   Headers:\n     ${documents[file].headers.split('\n').join('\n     ')}\n`;
                    }
                    return fileSummary;
                })
                    .join('\n') +
                    `\n\nIMPORTANT: if doing anything more than basic model calling, look up "${language}/models.md" file, it contains important details about how to work with models.\n\n`,
            });
        }
        else {
            for (const file of files) {
                if (documents[file]) {
                    content.push({ type: 'text', text: documents[file]?.text });
                }
                else {
                    content.push({ type: 'text', text: `${file} not found` });
                }
            }
        }
        return { content };
    });
}
//# sourceMappingURL=docs.js.map