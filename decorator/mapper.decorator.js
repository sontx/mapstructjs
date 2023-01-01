"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mapper = exports.DEFAULT_CONFIG = void 0;
const constants_1 = require("../constants");
exports.DEFAULT_CONFIG = {};
/**
 * Annotates a class is a object mapper. This annotation is not always required to define a object mapper.
 */
function Mapper(mapper) {
    return (target) => {
        const currentMapper = mapper && Array.isArray(mapper) ? { uses: mapper } : mapper;
        Reflect.defineMetadata(constants_1.MAPPER_METADATA, currentMapper !== null && currentMapper !== void 0 ? currentMapper : exports.DEFAULT_CONFIG, target);
    };
}
exports.Mapper = Mapper;
//# sourceMappingURL=mapper.decorator.js.map