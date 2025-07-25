"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcp = void 0;
const utils_1 = require("@genkit-ai/tools-common/utils");
const commander_1 = require("commander");
const server_1 = require("../mcp/server");
const manager_utils_1 = require("../utils/manager-utils");
exports.mcp = new commander_1.Command('mcp')
    .option('--project-root [projectRoot]', 'Project root')
    .description('run MCP stdio server (EXPERIMENTAL, subject to change)')
    .action(async (options) => {
    (0, utils_1.forceStderr)();
    const manager = await (0, manager_utils_1.startManager)(options.projectRoot ?? (await (0, utils_1.findProjectRoot)()), true);
    await (0, server_1.startMcpServer)(manager);
});
//# sourceMappingURL=mcp.js.map