"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mapping = void 0;
const constants_1 = require("../constants");
/**
 * Configure for a specific mapping property from source to target.
 */
function Mapping(mapping) {
    return (target, propertyKey) => {
        var _a, _b, _c;
        const methods = (_a = Reflect.getOwnMetadata(constants_1.MAPPING_METADATA, target.constructor)) !== null && _a !== void 0 ? _a : {};
        const currentMapping = typeof mapping === 'object'
            ? Object.assign(Object.assign({}, mapping), { source: (_b = mapping.source) !== null && _b !== void 0 ? _b : mapping.target }) : {
            target: mapping,
            source: mapping,
        };
        methods[propertyKey] = (_c = methods[propertyKey]) !== null && _c !== void 0 ? _c : {};
        methods[propertyKey][currentMapping.target] = currentMapping;
        Reflect.defineMetadata(constants_1.MAPPING_METADATA, methods, target.constructor);
    };
}
exports.Mapping = Mapping;
//# sourceMappingURL=mapping.decorator.js.map