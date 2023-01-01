"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultMapperUsesLinker = void 0;
const service_configurable_1 = require("./service-configurable");
/**
 * Default implementation for {@see MapperUsesLinker} that supports for matching subclasses of source type and target type.
 */
class DefaultMapperUsesLinker extends service_configurable_1.ServiceConfigurable {
    link(mapperDescriptor) {
        this.buildMapMethodGraph(mapperDescriptor);
        this.linkUsesMapperDescriptors(mapperDescriptor);
    }
    buildMapMethodGraph(mapperDescriptor) {
        if (mapperDescriptor.mapMethodGraph) {
            return;
        }
        mapperDescriptor.mapMethodGraph = new Map();
        const mapMethodGraph = mapperDescriptor.mapMethodGraph;
        const buildGraph = (mapper) => {
            for (const useMapper of mapper.uses) {
                for (const mapMethodName in useMapper.mapMethods) {
                    const mapMethodDescriptor = useMapper.mapMethods[mapMethodName];
                    const mapMethodMetadata = mapMethodDescriptor.metadata;
                    if (!mapMethodGraph.has(mapMethodMetadata.targetType)) {
                        mapMethodGraph.set(mapMethodMetadata.targetType, new Map());
                    }
                    if (mapMethodGraph.get(mapMethodMetadata.targetType).has(mapMethodMetadata.sourceType)) {
                        continue;
                    }
                    mapMethodDescriptor.mapperDescriptor = useMapper;
                    mapMethodGraph.get(mapMethodMetadata.targetType).set(mapMethodMetadata.sourceType, mapMethodDescriptor);
                }
            }
            for (const useMapper of mapper.uses) {
                buildGraph(useMapper);
            }
        };
        buildGraph(mapperDescriptor);
    }
    linkUsesMapperDescriptors(mapperDescriptor) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const flattenMappingDescriptors = [];
        for (const mapMethodName in mapperDescriptor.mapMethods) {
            const mapMethodDescriptor = mapperDescriptor.mapMethods[mapMethodName];
            if (mapMethodDescriptor.metadata.exact) {
                continue;
            }
            for (const targetPropName in mapMethodDescriptor.mappings) {
                const mappingDescriptor = mapMethodDescriptor.mappings[targetPropName];
                if (!mappingDescriptor.metadata &&
                    ((_a = mappingDescriptor.targetPropertyMetadata) === null || _a === void 0 ? void 0 : _a.type) &&
                    ((_b = mappingDescriptor.sourcePropertyMetadata) === null || _b === void 0 ? void 0 : _b.type) &&
                    !this.options.typeCompareFn((_c = mappingDescriptor.sourcePropertyMetadata) === null || _c === void 0 ? void 0 : _c.type, (_d = mappingDescriptor.targetPropertyMetadata) === null || _d === void 0 ? void 0 : _d.type)) {
                    flattenMappingDescriptors.push({
                        sourceType: (_e = mappingDescriptor.sourcePropertyMetadata) === null || _e === void 0 ? void 0 : _e.type,
                        targetType: (_f = mappingDescriptor.targetPropertyMetadata) === null || _f === void 0 ? void 0 : _f.type,
                        descriptor: mappingDescriptor,
                        methodDescriptor: mapMethodDescriptor,
                    });
                }
            }
        }
        for (const linkToMappingDescriptor of flattenMappingDescriptors) {
            const linkFromMapMethodDescriptor = (_h = (_g = mapperDescriptor.mapMethodGraph) === null || _g === void 0 ? void 0 : _g.get(linkToMappingDescriptor.targetType)) === null || _h === void 0 ? void 0 : _h.get(linkToMappingDescriptor.sourceType);
            if (linkFromMapMethodDescriptor) {
                linkToMappingDescriptor.descriptor.transform = (sourceValue, context) => {
                    return linkFromMapMethodDescriptor.mapFn(sourceValue, Object.assign(Object.assign({}, context), { source: sourceValue, sourceType: linkToMappingDescriptor.sourceType, targetType: linkToMappingDescriptor.targetType, previousContext: context, methodDescriptor: linkFromMapMethodDescriptor, getObjectMapper: () => linkFromMapMethodDescriptor.mapperDescriptor.instanceResolve() }));
                };
            }
        }
    }
}
exports.DefaultMapperUsesLinker = DefaultMapperUsesLinker;
//# sourceMappingURL=mapper-uses-linker.js.map