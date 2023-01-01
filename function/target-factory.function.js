"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TARGET_FACTORY_FN = void 0;
/**
 * Default implementation for {@see TargetFactoryFn} that calls 'new' keyword to instance the target object.
 */
const DEFAULT_TARGET_FACTORY_FN = (targetType, mappingContext) => {
    return targetType ? new targetType(...mappingContext.arguments) : {};
};
exports.DEFAULT_TARGET_FACTORY_FN = DEFAULT_TARGET_FACTORY_FN;
//# sourceMappingURL=target-factory.function.js.map