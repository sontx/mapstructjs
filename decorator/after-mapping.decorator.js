"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AfterMapping = void 0;
const constants_1 = require("../constants");
const hook_mapping_decorator_1 = require("./hook-mapping.decorator");
/**
 * Annotates a method is a hook that will be called after mapping source to target.
 */
function AfterMapping(afterMapping) {
    return (target, propertyKey, descriptor) => {
        var _a;
        const methods = (_a = Reflect.getOwnMetadata(constants_1.AFTER_MAPPING_METADATA, target.constructor)) !== null && _a !== void 0 ? _a : {};
        methods[propertyKey] = (0, hook_mapping_decorator_1.extractConfig)(afterMapping);
        Reflect.defineMetadata(constants_1.AFTER_MAPPING_METADATA, methods, target.constructor);
        return descriptor;
    };
}
exports.AfterMapping = AfterMapping;
//# sourceMappingURL=after-mapping.decorator.js.map