"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PROXY_METHOD_FN = void 0;
const precondition_1 = require("../helper/precondition");
function typeMapping(target, methodDescriptor, mappingContext) {
    for (const targetPropName in methodDescriptor.mappings) {
        const mappingDescriptor = methodDescriptor.mappings[targetPropName];
        const sourceValue = mappingContext.options.propertyExtractFn(mappingContext.source, mappingDescriptor.source, mappingDescriptor.splitSources);
        target[targetPropName] = mappingDescriptor.transform(sourceValue, mappingContext);
    }
}
function anonymousTypeMapping(target, methodDescriptor, mappingContext) {
    const { properties, includes, excludes } = methodDescriptor.metadata;
    if (properties) {
        typeMapping(target, methodDescriptor, mappingContext);
    }
    else if (excludes) {
        const source = mappingContext.source;
        for (const sourceProp in source) {
            if (!excludes[sourceProp]) {
                target[sourceProp] = source[sourceProp];
            }
        }
    }
    else if (includes) {
        const source = mappingContext.source;
        Object.assign(target, source);
        typeMapping(target, methodDescriptor, mappingContext);
    }
}
/**
 * Default implementation for {@see ProxyMethodFn} that supports before and after hooks.
 */
const DEFAULT_PROXY_METHOD_FN = (source, mappingContext) => {
    const methodDescriptor = mappingContext.methodDescriptor;
    (0, precondition_1.mustBeDefined)(mappingContext.options.propertyExtractFn, 'propertyExtractFn must be defined');
    const target = methodDescriptor.targetFactoryFn(methodDescriptor.metadata.targetType, mappingContext);
    mappingContext = Object.assign(Object.assign({}, mappingContext), { target });
    const callBeforeHook = () => {
        const beforeMethodNames = Object.keys(methodDescriptor.beforeMappingMethods);
        if (beforeMethodNames.length === 0) {
            return;
        }
        const objectMapper = mappingContext.getObjectMapper();
        for (const beforeMethodName of beforeMethodNames) {
            const beforeMethod = objectMapper[beforeMethodName];
            if (typeof beforeMethod === 'function') {
                beforeMethod.call(objectMapper, mappingContext);
            }
        }
    };
    const callAfterHook = () => {
        const afterMethodNames = Object.keys(methodDescriptor.afterMappingMethods);
        if (afterMethodNames.length === 0) {
            return;
        }
        const objectMapper = mappingContext.getObjectMapper();
        let returnValue;
        for (const afterMethodName of afterMethodNames) {
            const afterMethod = objectMapper[afterMethodName];
            if (typeof afterMethod === 'function') {
                const ret = afterMethod.call(objectMapper, mappingContext);
                if (!returnValue && typeof ret === 'object' && ret) {
                    returnValue = ret;
                }
            }
        }
        return returnValue;
    };
    callBeforeHook();
    if (source) {
        if (methodDescriptor.metadata.targetType) {
            typeMapping(target, methodDescriptor, mappingContext);
        }
        else {
            anonymousTypeMapping(target, methodDescriptor, mappingContext);
        }
    }
    const returnValue = callAfterHook();
    if (typeof returnValue === 'object' && returnValue) {
        return returnValue;
    }
    return target;
};
exports.DEFAULT_PROXY_METHOD_FN = DEFAULT_PROXY_METHOD_FN;
//# sourceMappingURL=proxy-method.function.js.map