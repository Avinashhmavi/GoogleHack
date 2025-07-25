"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineTraceTools = defineTraceTools;
const zod_1 = __importDefault(require("zod"));
function defineTraceTools(server, manager) {
    server.registerTool('get_trace', {
        title: 'Get Genkit Trace',
        description: 'Returns the trace details',
        inputSchema: {
            traceId: zod_1.default
                .string()
                .describe('trace id (typically returned after running a flow or other actions)'),
        },
    }, async ({ traceId }) => {
        try {
            const response = await manager.getTrace({ traceId });
            return {
                content: [
                    { type: 'text', text: JSON.stringify(response, undefined, 2) },
                ],
            };
        }
        catch (e) {
            return {
                content: [{ type: 'text', text: `Error: ${e}` }],
            };
        }
    });
}
//# sourceMappingURL=trace.js.map