"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Property = exports.DEFAULT_CONFIG = void 0;
const constants_1 = require("../constants");
require("reflect-metadata");
exports.DEFAULT_CONFIG = {};
/**
 * Annotates a field is a mapping property, that can be either source property or target property.
 * This annotation is not always required to define a mapping property.
 */
function Property(property) {
    return (target, propertyKey) => {
        var _a;
        const props = (_a = Reflect.getOwnMetadata(constants_1.PROPERTY_METADATA, target.constructor)) !== null && _a !== void 0 ? _a : {};
        props[propertyKey] = property
            ? property.constructor.name === 'Object' && 'type' in property
                ? property
                : {
                    type: property,
                }
            : exports.DEFAULT_CONFIG;
        Reflect.defineMetadata(constants_1.PROPERTY_METADATA, props, target.constructor);
    };
}
exports.Property = Property;
//# sourceMappingURL=property.decorator.js.map