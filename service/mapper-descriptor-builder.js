"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultMapperDescriptorBuilder = void 0;
const constants_1 = require("../constants");
const service_configurable_1 = require("./service-configurable");
const precondition_1 = require("../helper/precondition");
function getSourcePath(source) {
    return source.split('.').filter(Boolean);
}
/**
 * Default implementation for {@see MapperDescriptorBuilder} that uses annotations to build descriptors.
 */
class DefaultMapperDescriptorBuilder extends service_configurable_1.ServiceConfigurable {
    constructor() {
        super(...arguments);
        this.cacheMapperDescriptor = new Map();
    }
    build(objectMapperClass) {
        (0, precondition_1.mustBeDefined)(this.options.typeCompareFn, 'typeCompareFn must be defined');
        (0, precondition_1.mustBeDefined)(this.options.proxyMethodFn, 'proxyMethodFn must be defined');
        (0, precondition_1.mustBeDefined)(this.options.targetFactoryFn, 'targetFactoryFn must be defined');
        (0, precondition_1.mustBeDefined)(this.options.propertyMapFn, 'propertyMapFn must be defined');
        const mapperDescriptor = this.buildMapperDescriptor(objectMapperClass);
        this.fillMapperDescriptorForInjectDescriptor(mapperDescriptor);
        return mapperDescriptor;
    }
    buildMapperDescriptor(objectMapperClass) {
        if (this.cacheMapperDescriptor.has(objectMapperClass)) {
            return this.cacheMapperDescriptor.get(objectMapperClass);
        }
        const mapperMetadata = Reflect.getOwnMetadata(constants_1.MAPPER_METADATA, objectMapperClass);
        const mapperDescriptor = {
            mapMethods: {},
            injects: {},
            uses: [],
            metadata: mapperMetadata,
            type: objectMapperClass,
            instanceResolve: () => null,
        };
        this.cacheMapperDescriptor.set(objectMapperClass, mapperDescriptor);
        this.buildMapMethodDescriptors(objectMapperClass, mapperDescriptor);
        this.buildUsesMappers(mapperMetadata, mapperDescriptor);
        this.buildInjectDecorators(objectMapperClass, mapperDescriptor);
        return mapperDescriptor;
    }
    buildMapMethodDescriptors(objectMapperClass, mapperDescriptor) {
        var _a, _b;
        const mapMethodsMetadata = ((_a = Reflect.getMetadata(constants_1.MAP_METHOD_METADATA, objectMapperClass)) !== null && _a !== void 0 ? _a : {});
        const mappingsMetadata = ((_b = Reflect.getMetadata(constants_1.MAPPING_METADATA, objectMapperClass)) !== null && _b !== void 0 ? _b : {});
        const beforeMappingDescriptors = this.buildHookDescriptors(objectMapperClass, constants_1.BEFORE_MAPPING_METADATA);
        const afterMappingDescriptors = this.buildHookDescriptors(objectMapperClass, constants_1.AFTER_MAPPING_METADATA);
        for (const mapMethodName in mapMethodsMetadata) {
            this.buildMapMethodDescriptor(mapMethodsMetadata, mapMethodName, mapperDescriptor, mappingsMetadata, beforeMappingDescriptors, afterMappingDescriptors);
        }
    }
    buildMapMethodDescriptor(mapMethodsMetadata, mapMethodName, mapperDescriptor, mappingsMetadata, beforeMappingDescriptors, afterMappingDescriptors) {
        var _a, _b, _c, _d;
        const mapMethodMetadata = mapMethodsMetadata[mapMethodName];
        const mapMethodDescriptor = {
            name: mapMethodName,
            metadata: mapMethodMetadata,
            mappings: {},
            targetFactoryFn: (_a = mapMethodMetadata.targetFactoryFn) !== null && _a !== void 0 ? _a : (_b = this.options) === null || _b === void 0 ? void 0 : _b.targetFactoryFn,
            beforeMappingMethods: {},
            afterMappingMethods: {},
        };
        mapperDescriptor.mapMethods[mapMethodName] = mapMethodDescriptor;
        mapMethodDescriptor.mappings = this.buildMappingDescriptors(mapMethodMetadata.sourceType, mapMethodMetadata.targetType, (_c = mappingsMetadata[mapMethodName]) !== null && _c !== void 0 ? _c : {}, mapMethodMetadata.ignoreUnknownProperties === true
            ? true
            : mapMethodMetadata.ignoreUnknownProperties === false
                ? false
                : (_d = mapperDescriptor.metadata) === null || _d === void 0 ? void 0 : _d.ignoreUnknownProperties);
        const addMappings = (targetSources) => {
            var _a;
            for (const targetSource of targetSources) {
                if (mapMethodDescriptor.mappings[targetSource.target]) {
                    continue;
                }
                mapMethodDescriptor.mappings[targetSource.target] = {
                    target: targetSource.target,
                    source: targetSource.source,
                    splitSources: getSourcePath(targetSource.source),
                    transform: (_a = this.options) === null || _a === void 0 ? void 0 : _a.propertyMapFn,
                };
            }
        };
        if (mapMethodMetadata.properties) {
            addMappings(mapMethodMetadata.properties);
        }
        if (mapMethodMetadata.includes) {
            addMappings(mapMethodMetadata.includes);
        }
        mapMethodDescriptor.beforeMappingMethods = this.mapHookDescriptors(beforeMappingDescriptors, mapMethodDescriptor);
        mapMethodDescriptor.afterMappingMethods = this.mapHookDescriptors(afterMappingDescriptors, mapMethodDescriptor);
        mapMethodDescriptor.mapFn = this.options.proxyMethodFn;
    }
    mapHookDescriptors(hookMappingDescriptors, mapMethodDescriptor) {
        const ret = {};
        const typeCompareFn = this.options.typeCompareFn;
        for (const hookMappingMethodName in hookMappingDescriptors) {
            const hookMappingDescriptor = hookMappingDescriptors[hookMappingMethodName];
            let useHook = false;
            if ('methodName' in hookMappingDescriptor.metadata) {
                if (hookMappingDescriptor.metadata.methodName === mapMethodDescriptor.name) {
                    useHook = true;
                }
            }
            else if ('all' in hookMappingDescriptor.metadata) {
                useHook = true;
            }
            else if (typeCompareFn(mapMethodDescriptor.metadata.targetType, hookMappingDescriptor.metadata.targetType) &&
                typeCompareFn(mapMethodDescriptor.metadata.sourceType, hookMappingDescriptor.metadata.sourceType)) {
                useHook = true;
            }
            if (useHook) {
                ret[hookMappingDescriptor.name] = hookMappingDescriptor;
            }
        }
        return ret;
    }
    buildHookDescriptors(objectMapperClass, metadataKey) {
        var _a;
        const hookMappingsMetadata = ((_a = Reflect.getMetadata(metadataKey, objectMapperClass)) !== null && _a !== void 0 ? _a : {});
        const hookMappingDescriptors = {};
        for (const mappingMethodName in hookMappingsMetadata) {
            const hookMappingMetadata = hookMappingsMetadata[mappingMethodName];
            hookMappingDescriptors[mappingMethodName] = {
                name: mappingMethodName,
                metadata: hookMappingMetadata,
            };
        }
        return hookMappingDescriptors;
    }
    buildMappingDescriptors(sourceType, targetType, mappingsMetadata, ignoreUnknownProperties) {
        var _a;
        const targetPropertiesMetadata = (targetType ? Reflect.getMetadata(constants_1.PROPERTY_METADATA, targetType) : {});
        const sourcePropertiesMetadata = ((_a = (sourceType ? Reflect.getMetadata(constants_1.PROPERTY_METADATA, sourceType) : {})) !== null && _a !== void 0 ? _a : {});
        const descriptors = {};
        const createDescriptor = (propertyName, mappingMetadata, targetPropertyMetadata) => {
            var _a, _b, _c;
            const source = (_a = mappingMetadata === null || mappingMetadata === void 0 ? void 0 : mappingMetadata.source) !== null && _a !== void 0 ? _a : propertyName;
            return {
                metadata: mappingMetadata,
                targetPropertyMetadata: targetPropertyMetadata,
                sourcePropertyMetadata: sourcePropertiesMetadata[propertyName],
                target: propertyName,
                source: source,
                splitSources: getSourcePath(source),
                transform: (_b = mappingMetadata === null || mappingMetadata === void 0 ? void 0 : mappingMetadata.transform) !== null && _b !== void 0 ? _b : (_c = this.options) === null || _c === void 0 ? void 0 : _c.propertyMapFn,
            };
        };
        for (const propertyName in targetPropertiesMetadata) {
            const mappingMetadata = mappingsMetadata[propertyName];
            if (mappingMetadata === null || mappingMetadata === void 0 ? void 0 : mappingMetadata.ignore) {
                continue;
            }
            const metadata = targetPropertiesMetadata[propertyName];
            descriptors[propertyName] = createDescriptor(propertyName, mappingMetadata, metadata);
        }
        if (!ignoreUnknownProperties) {
            for (const propertyName in mappingsMetadata) {
                const mappingMetadata = mappingsMetadata[propertyName];
                if (mappingMetadata === null || mappingMetadata === void 0 ? void 0 : mappingMetadata.ignore) {
                    continue;
                }
                if (!descriptors[propertyName]) {
                    descriptors[propertyName] = createDescriptor(propertyName, mappingMetadata, undefined);
                }
            }
        }
        return descriptors;
    }
    buildUsesMappers(mapperMetadata, mapperDescriptor) {
        var _a;
        for (const mapper of (_a = mapperMetadata === null || mapperMetadata === void 0 ? void 0 : mapperMetadata.uses) !== null && _a !== void 0 ? _a : []) {
            if (mapper === mapperDescriptor.type) {
                throw new TypeError(`Can not use ${mapper.name} as a dependency of itself`);
            }
            mapperDescriptor.uses.push(this.buildMapperDescriptor(mapper));
        }
    }
    buildInjectDecorators(objectMapperClass, mapperDescriptor) {
        var _a;
        const injectsMetadata = ((_a = Reflect.getMetadata(constants_1.INJECT_METADATA, objectMapperClass)) !== null && _a !== void 0 ? _a : {});
        for (const injectFieldName in injectsMetadata) {
            const injectMetadata = injectsMetadata[injectFieldName];
            mapperDescriptor.injects[injectFieldName] = {
                name: injectFieldName,
                type: injectMetadata.type,
                metadata: injectMetadata,
            };
            if (mapperDescriptor.uses.every((mapper) => !this.options.typeCompareFn(mapper.type, injectMetadata.type))) {
                mapperDescriptor.uses.push(this.buildMapperDescriptor(injectMetadata.type));
            }
        }
    }
    fillMapperDescriptorForInjectDescriptor(mapperDescriptor) {
        for (const injectFieldName in mapperDescriptor.injects) {
            const injectDescriptor = mapperDescriptor.injects[injectFieldName];
            injectDescriptor.mapperDescriptor = this.cacheMapperDescriptor.get(injectDescriptor.type);
            if (injectDescriptor.mapperDescriptor) {
                this.fillMapperDescriptorForInjectDescriptor(injectDescriptor.mapperDescriptor);
            }
        }
    }
}
exports.DefaultMapperDescriptorBuilder = DefaultMapperDescriptorBuilder;
//# sourceMappingURL=mapper-descriptor-builder.js.map