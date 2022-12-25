import { MapMethodDescriptor, MapperDescriptor, MappingDescriptor } from '../descriptor';
import { Class } from '../helper';
import { ServiceConfigurable } from './service-configurable';

/**
 * Links mapping properties with other object mappers if source type and target type are both matched from the current
 * mapping property and other object mapper's mapping method.
 */
export interface MapperUsesLinker {
  link(mapperDescriptor: MapperDescriptor);
}

type MapMethodDescriptorEx = MapMethodDescriptor & {
  mapperDescriptor: MapperDescriptor;
};

type MapperDescriptorEx = MapperDescriptor & {
  // targetType -> sourceTypes
  mapMethodGraph?: Map<Class, Map<Class, MapMethodDescriptorEx>>;
};

/**
 * Default implementation for {@see MapperUsesLinker} that supports for matching subclasses of source type and target type.
 */
export class DefaultMapperUsesLinker extends ServiceConfigurable implements MapperUsesLinker {
  link(mapperDescriptor: MapperDescriptor) {
    this.buildMapMethodGraph(mapperDescriptor);
    this.linkUsesMapperDescriptors(mapperDescriptor);
  }

  private buildMapMethodGraph(mapperDescriptor: MapperDescriptorEx) {
    if (mapperDescriptor.mapMethodGraph) {
      return;
    }

    mapperDescriptor.mapMethodGraph = new Map<Class, Map<Class, MapMethodDescriptorEx>>();
    const mapMethodGraph = mapperDescriptor.mapMethodGraph;

    const buildGraph = (mapper: MapperDescriptor) => {
      for (const useMapper of mapper.uses) {
        for (const mapMethodName in useMapper.mapMethods) {
          const mapMethodDescriptor: MapMethodDescriptorEx = useMapper.mapMethods[mapMethodName] as any;
          const mapMethodMetadata = mapMethodDescriptor.metadata;
          if (!mapMethodGraph.has(mapMethodMetadata.targetType)) {
            mapMethodGraph.set(mapMethodMetadata.targetType, new Map<Class, MapMethodDescriptorEx>());
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

  private linkUsesMapperDescriptors(mapperDescriptor: MapperDescriptorEx) {
    const flattenMappingDescriptors: {
      sourceType: Class;
      targetType: Class;
      methodDescriptor: MapMethodDescriptor;
      descriptor: MappingDescriptor;
    }[] = [];

    for (const mapMethodName in mapperDescriptor.mapMethods) {
      const mapMethodDescriptor = mapperDescriptor.mapMethods[mapMethodName];
      if (mapMethodDescriptor.metadata.exact) {
        continue;
      }

      for (const targetPropName in mapMethodDescriptor.mappings) {
        const mappingDescriptor = mapMethodDescriptor.mappings[targetPropName];
        if (
          !mappingDescriptor.metadata &&
          mappingDescriptor.targetPropertyMetadata?.type &&
          mappingDescriptor.sourcePropertyMetadata?.type &&
          !this.options.typeCompareFn(
            mappingDescriptor.sourcePropertyMetadata?.type,
            mappingDescriptor.targetPropertyMetadata?.type,
          )
        ) {
          flattenMappingDescriptors.push({
            sourceType: mappingDescriptor.sourcePropertyMetadata?.type,
            targetType: mappingDescriptor.targetPropertyMetadata?.type,
            descriptor: mappingDescriptor,
            methodDescriptor: mapMethodDescriptor,
          });
        }
      }
    }

    for (const linkToMappingDescriptor of flattenMappingDescriptors) {
      const linkFromMapMethodDescriptor = mapperDescriptor.mapMethodGraph
        ?.get(linkToMappingDescriptor.targetType)
        ?.get(linkToMappingDescriptor.sourceType);

      if (linkFromMapMethodDescriptor) {
        linkToMappingDescriptor.descriptor.transform = (sourceValue, context) => {
          return linkFromMapMethodDescriptor.mapFn(sourceValue, {
            ...context,
            source: sourceValue,
            sourceType: linkToMappingDescriptor.sourceType,
            targetType: linkToMappingDescriptor.targetType,
            previousContext: context,
            methodDescriptor: linkFromMapMethodDescriptor,
            getObjectMapper: () => linkFromMapMethodDescriptor.mapperDescriptor.instanceResolve(),
          });
        };
      }
    }
  }
}
