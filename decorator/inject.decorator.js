"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inject = void 0;
const constants_1 = require("../constants");
/**
 * Annotates a field that its value will be injected while creating object mapper.
 * If the injected class is another object mapper its mapping method can be used while mapping properties if needed.
 */
function Inject(inject) {
    return (target, propertyKey) => {
        var _a;
        const props = (_a = Reflect.getOwnMetadata(constants_1.INJECT_METADATA, target.constructor)) !== null && _a !== void 0 ? _a : {};
        props[propertyKey] =
            inject.constructor.name === 'Object' && 'type' in inject
                ? inject
                : {
                    type: inject,
                };
        Reflect.defineMetadata(constants_1.INJECT_METADATA, props, target.constructor);
    };
}
exports.Inject = Inject;
//# sourceMappingURL=inject.decorator.js.map