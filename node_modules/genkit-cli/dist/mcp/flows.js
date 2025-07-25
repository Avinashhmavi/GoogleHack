"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineFlowTools = defineFlowTools;
const zod_1 = __importDefault(require("zod"));
function defineFlowTools(server, manager) {
    server.registerTool('list_flows', {
        title: 'List Genkit Flows',
        description: 'Use this to discover available Genkit flows or inspect the input schema of Genkit flows to know how to successfully call them.',
    }, async () => {
        const actions = await manager.listActions();
        let flows = '';
        for (const key of Object.keys(actions)) {
            if (key.startsWith('/flow/')) {
                flows += ' - Flow name: ' + key.substring('/flow/'.length) + '\n';
                if (actions[key].description) {
                    flows += '   Description: ' + actions[key].description + '\n';
                }
                flows +=
                    '   Input schema: ' +
                        JSON.stringify(actions[key].inputSchema, undefined, 2) +
                        '\n\n';
            }
        }
        return { content: [{ type: 'text', text: flows }] };
    });
    server.registerTool('run_flow', {
        title: 'Run Flow',
        description: 'Runs the flow with the provided input',
        inputSchema: {
            flowName: zod_1.default.string().describe('name of the flow'),
            input: zod_1.default
                .string()
                .describe('Flow input as JSON object encoded as string (it will be passed through `JSON.parse`). Must conform to the schema.')
                .optional(),
        },
    }, async ({ flowName, input }) => {
        try {
            const response = await manager.runAction({
                key: `/flow/${flowName}`,
                input: input !== undefined ? JSON.parse(input) : undefined,
            });
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
//# sourceMappingURL=flows.js.map