"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMcpServer = startMcpServer;
const utils_1 = require("@genkit-ai/tools-common/utils");
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const docs_1 = require("../mcp/docs");
const flows_1 = require("./flows");
const trace_1 = require("./trace");
async function startMcpServer(manager) {
    const server = new mcp_js_1.McpServer({
        name: 'Genkit MCP',
        version: '0.0.1',
    });
    await (0, docs_1.defineDocsTool)(server);
    (0, flows_1.defineFlowTools)(server, manager);
    (0, trace_1.defineTraceTools)(server, manager);
    return new Promise(async (resolve) => {
        const transport = new stdio_js_1.StdioServerTransport();
        transport.onclose = () => {
            resolve(undefined);
        };
        await server.connect(transport);
        utils_1.logger.info('Genkit MCP Server running on stdio');
    });
}
//# sourceMappingURL=server.js.map