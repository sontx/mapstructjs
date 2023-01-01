"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapMethod = void 0;
const constants_1 = require("../constants");
const utils_1 = require("../helper/utils");
function convertToPropertyTargetSource(rawType) {
    var _a;
    if (typeof rawType === 'string') {
        return { target: rawType, source: rawType };
    }
    if (Array.isArray(rawType)) {
        if (rawType.length >= 1) {
            return { target: rawType[0], source: (_a = rawType[1]) !== null && _a !== void 0 ? _a : rawType[0] };
        }
    }
    else {
        return rawType;
    }
    return undefined;
}
function convertToPropertyTargetSources(rawTypes) {
    if (!rawTypes) {
        return undefined;
    }
    return rawTypes.map((rawType) => convertToPropertyTargetSource(rawType)).filter(Boolean);
}
/**
 * Annotates a method is a mapping method that be able to map source value to target value.
 */
function MapMethod(mapMethod) {
    var _a;
    let normalizedMapMethod;
    if (typeof mapMethod === 'object') {
        if ((0, utils_1.isEmptyObject)(mapMethod)) {
            throw new TypeError('Map method config must not be empty');
        }
        if (Array.isArray(mapMethod)) {
            if (typeof mapMethod[0] === 'function') {
                normalizedMapMethod = {
                    targetType: mapMethod[0],
                    sourceType: mapMethod[1],
                };
            }
            else {
                normalizedMapMethod = {
                    properties: convertToPropertyTargetSources(mapMethod),
                };
            }
        }
        else {
            const anonymousConfigs = [mapMethod.includes, mapMethod.excludes, mapMethod.properties].filter(Boolean);
            if (anonymousConfigs.length > 1 || (anonymousConfigs.length === 1 && mapMethod.targetType)) {
                throw new TypeError('Only one includes, excludes, properties or targetType is allowed to define');
            }
            normalizedMapMethod = Object.assign(Object.assign({}, mapMethod), { includes: convertToPropertyTargetSources(mapMethod.includes), excludes: (_a = convertToPropertyTargetSources(mapMethod.excludes)) === null || _a === void 0 ? void 0 : _a.reduce((prev, curr) => {
                    prev[curr.target] = true;
                    return prev;
                }, {}), properties: convertToPropertyTargetSources(mapMethod.properties) });
        }
    }
    else {
        normalizedMapMethod = {
            targetType: mapMethod,
        };
    }
    if (normalizedMapMethod.sourceType === normalizedMapMethod.targetType &&
        normalizedMapMethod.sourceType &&
        normalizedMapMethod.targetType) {
        throw new TypeError('Source type and target type must not be the same');
    }
    return (target, propertyKey) => {
        var _a;
        const methods = (_a = Reflect.getOwnMetadata(constants_1.MAP_METHOD_METADATA, target.constructor)) !== null && _a !== void 0 ? _a : {};
        methods[propertyKey] = normalizedMapMethod;
        Reflect.defineMetadata(constants_1.MAP_METHOD_METADATA, methods, target.constructor);
    };
}
exports.MapMethod = MapMethod;
//# sourceMappingURL=map-method.decorator.js.map