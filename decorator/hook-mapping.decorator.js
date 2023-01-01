"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractConfig = exports.DEFAULT_CONFIG = void 0;
exports.DEFAULT_CONFIG = { all: true };
function extractConfig(config) {
    let currentMapping = config !== null && config !== void 0 ? config : exports.DEFAULT_CONFIG;
    if (typeof config === 'string') {
        currentMapping = {
            methodName: config,
        };
    }
    else if (typeof config === 'boolean' && config) {
        currentMapping = {
            all: true,
        };
    }
    else if (Array.isArray(config) && config.length >= 2) {
        currentMapping = {
            targetType: config[0],
            sourceType: config[1],
        };
    }
    return currentMapping;
}
exports.extractConfig = extractConfig;
//# sourceMappingURL=hook-mapping.decorator.js.map