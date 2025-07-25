"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverHarness = exports.SERVER_HARNESS_COMMAND = void 0;
const server_1 = require("@genkit-ai/tools-common/server");
const utils_1 = require("@genkit-ai/tools-common/utils");
const commander_1 = require("commander");
const fs_1 = __importDefault(require("fs"));
const manager_utils_1 = require("../utils/manager-utils");
function redirectStdoutToFile(logFile) {
    const myLogFileStream = fs_1.default.createWriteStream(logFile);
    const originalStdout = process.stdout.write;
    function writeStdout() {
        originalStdout.apply(process.stdout, arguments);
        myLogFileStream.write.apply(myLogFileStream, arguments);
    }
    process.stdout.write = writeStdout;
    process.stderr.write = process.stdout.write;
}
exports.SERVER_HARNESS_COMMAND = '__server-harness';
exports.serverHarness = new commander_1.Command('__server-harness')
    .argument('<port>', 'Port to serve on')
    .argument('<logFile>', 'Log file path')
    .action(async (port, logFile) => {
    redirectStdoutToFile(logFile);
    process.on('error', (error) => {
        utils_1.logger.error(`Error in tools process: ${error}`);
    });
    process.on('uncaughtException', (err, somethingelse) => {
        utils_1.logger.error(`Uncaught error in tools process: ${err} ${somethingelse}`);
    });
    process.on('unhandledRejection', (reason, _p) => {
        utils_1.logger.error(`Unhandled rejection in tools process: ${reason}`);
    });
    const portNum = Number.parseInt(port) || 4100;
    const manager = await (0, manager_utils_1.startManager)(await (0, utils_1.findProjectRoot)(), true);
    await (0, server_1.startServer)(manager, portNum);
});
//# sourceMappingURL=server-harness.js.map