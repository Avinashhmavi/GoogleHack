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
exports.resolveTelemetryServer = resolveTelemetryServer;
exports.startManager = startManager;
exports.runWithManager = runWithManager;
const telemetry_server_1 = require("@genkit-ai/telemetry-server");
const manager_1 = require("@genkit-ai/tools-common/manager");
const utils_1 = require("@genkit-ai/tools-common/utils");
const get_port_1 = __importStar(require("get-port"));
async function resolveTelemetryServer(projectRoot) {
    let telemetryServerUrl = process.env.GENKIT_TELEMETRY_SERVER;
    if (!telemetryServerUrl) {
        const telemetryPort = await (0, get_port_1.default)({ port: (0, get_port_1.makeRange)(4033, 4999) });
        telemetryServerUrl = `http://localhost:${telemetryPort}`;
        await (0, telemetry_server_1.startTelemetryServer)({
            port: telemetryPort,
            traceStore: new telemetry_server_1.LocalFileTraceStore({
                storeRoot: projectRoot,
                indexRoot: projectRoot,
            }),
        });
    }
    return telemetryServerUrl;
}
async function startManager(projectRoot, manageHealth) {
    const telemetryServerUrl = await resolveTelemetryServer(projectRoot);
    const manager = manager_1.RuntimeManager.create({
        telemetryServerUrl,
        manageHealth,
        projectRoot,
    });
    return manager;
}
async function runWithManager(projectRoot, fn) {
    let manager;
    try {
        manager = await startManager(projectRoot, false);
    }
    catch (e) {
        process.exit(1);
    }
    try {
        await fn(manager);
    }
    catch (err) {
        utils_1.logger.error('Command exited with an Error:');
        const error = err;
        if (typeof error.data === 'object') {
            const errorStatus = error.data;
            const { code, details, message } = errorStatus;
            utils_1.logger.error(`\tCode: ${code}`);
            utils_1.logger.error(`\tMessage: ${message}`);
            utils_1.logger.error(`\tTrace: http://localhost:4200/traces/${details.traceId}\n`);
        }
        else {
            utils_1.logger.error(`\tMessage: ${error.data}\n`);
        }
        utils_1.logger.error('Stack trace:');
        utils_1.logger.error(`${error.stack}`);
    }
}
//# sourceMappingURL=manager-utils.js.map