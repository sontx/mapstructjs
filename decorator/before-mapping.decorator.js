"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeforeMapping = void 0;
const constants_1 = require("../constants");
const hook_mapping_decorator_1 = require("./hook-mapping.decorator");
/**
 * Annotates a method is a hook that will be called before mapping source to target.
 */
function BeforeMapping(beforeMapping) {
    return (target, propertyKey, descriptor) => {
        var _a;
        const methods = (_a = Reflect.getOwnMetadata(constants_1.BEFORE_MAPPING_METADATA, target.constructor)) !== null && _a !== void 0 ? _a : {};
        methods[propertyKey] = (0, hook_mapping_decorator_1.extractConfig)(beforeMapping);
        Reflect.defineMetadata(constants_1.BEFORE_MAPPING_METADATA, methods, target.constructor);
        return descriptor;
    };
}
exports.BeforeMapping = BeforeMapping;
//# sourceMappingURL=before-mapping.decorator.js.map