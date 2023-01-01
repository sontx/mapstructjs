"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PROPERTY_EXTRACT_FN = void 0;
/**
 * Default implementation for {@see PropertyExtractFn} that supports nested properties by specify 'dot' between levels.
 */
const DEFAULT_PROPERTY_EXTRACT_FN = (prop, rawPath, splitPaths) => {
    if (typeof prop !== 'object' || !prop) {
        return undefined;
    }
    if (splitPaths.length === 0) {
        return prop;
    }
    if (splitPaths.length <= 1) {
        return typeof prop === 'object' && prop ? prop[rawPath] : undefined;
    }
    let propVal = prop;
    for (const splitPath of splitPaths) {
        if (typeof propVal !== 'object') {
            return undefined;
        }
        propVal = propVal[splitPath];
    }
    return propVal;
};
exports.DEFAULT_PROPERTY_EXTRACT_FN = DEFAULT_PROPERTY_EXTRACT_FN;
//# sourceMappingURL=property-extract.function.js.map