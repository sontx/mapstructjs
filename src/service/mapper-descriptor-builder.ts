import { Class, MappingHook, ObjectType } from '../helper/types';
import { BeforeMappingDescriptor, MapMethodDescriptor, MapperDescriptor, MappingDescriptor } from '../descriptor';
import {
  AFTER_MAPPING_METADATA,
  BEFORE_MAPPING_METADATA,
  INJECT_METADATA,
  MAP_METHOD_METADATA,
  MAPPER_METADATA,
  MAPPING_METADATA,
  PROPERTY_METADATA,
} from '../constants';
import {
  InjectConfig,
  MapMethodConfig,
  MapperConfig,
  MappingConfig,
  PropertyTargetSource,
  PropertyConfig,
} from '../decorator';
import { ServiceConfigurable } from './service-configurable';
import { HookMappingDescriptor } from '../descriptor/hook-mapping.descriptor';
import { mustBeDefined } from '../helper/precondition';

/**
 * Builds {@see MapperDescriptor} from the object mapper class.
 */
export interface MapperDescriptorBuilder {
  build(objectMapperClass: Class): MapperDescriptor;
}

function getSourcePath(source: string) {
  return source.split('.').filter(Boolean);
}

/**
 * Default implementation for {@see MapperDescriptorBuilder} that uses annotations to build descriptors.
 */
export class DefaultMapperDescriptorBuilder extends ServiceConfigurable implements MapperDescriptorBuilder {
  private readonly cacheMapperDescriptor = new Map<Class, MapperDescriptor>();

  build(objectMapperClass: Class): MapperDescriptor {
    mustBeDefined(this.options.typeCompareFn, 'typeCompareFn must be defined');
    mustBeDefined(this.options.proxyMethodFn, 'proxyMethodFn must be defined');
    mustBeDefined(this.options.targetFactoryFn, 'targetFactoryFn must be defined');
    mustBeDefined(this.options.propertyMapFn, 'propertyMapFn must be defined');

    const mapperDescriptor = this.buildMapperDescriptor(objectMapperClass);
    this.fillMapperDescriptorForInjectDescriptor(mapperDescriptor);
    return mapperDescriptor;
  }

  private buildMapperDescriptor(objectMapperClass: Class): MapperDescriptor {
    if (this.cacheMapperDescriptor.has(objectMapperClass)) {
      return this.cacheMapperDescriptor.get(objectMapperClass);
    }

    const mapperMetadata = Reflect.getOwnMetadata(MAPPER_METADATA, objectMapperClass) as MapperConfig;
    const mapperDescriptor: MapperDescriptor = {
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

  private buildMapMethodDescriptors(objectMapperClass: Class, mapperDescriptor: MapperDescriptor) {
    const mapMethodsMetadata = (Reflect.getMetadata(MAP_METHOD_METADATA, objectMapperClass) ??
      {}) as ObjectType<MapMethodConfig>;
    const mappingsMetadata = (Reflect.getMetadata(MAPPING_METADATA, objectMapperClass) ?? {}) as ObjectType<
      ObjectType<MappingConfig>
    >;

    const beforeMappingDescriptors = this.buildHookDescriptors(objectMapperClass, BEFORE_MAPPING_METADATA);
    const afterMappingDescriptors = this.buildHookDescriptors(objectMapperClass, AFTER_MAPPING_METADATA);

    for (const mapMethodName in mapMethodsMetadata) {
      this.buildMapMethodDescriptor(
        mapMethodsMetadata,
        mapMethodName,
        mapperDescriptor,
        mappingsMetadata,
        beforeMappingDescriptors,
        afterMappingDescriptors,
      );
    }
  }

  private buildMapMethodDescriptor(
    mapMethodsMetadata: ObjectType<MapMethodConfig>,
    mapMethodName: string,
    mapperDescriptor: MapperDescriptor,
    mappingsMetadata: ObjectType<ObjectType<MappingConfig>>,
    beforeMappingDescriptors: ObjectType<BeforeMappingDescriptor>,
    afterMappingDescriptors: ObjectType<BeforeMappingDescriptor>,
  ) {
    const mapMethodMetadata = mapMethodsMetadata[mapMethodName];
    const mapMethodDescriptor: MapMethodDescriptor = {
      name: mapMethodName,
      metadata: mapMethodMetadata,
      mappings: {},
      targetFactoryFn: mapMethodMetadata.targetFactoryFn ?? this.options?.targetFactoryFn,
      beforeMappingMethods: {},
      afterMappingMethods: {},
    };
    mapperDescriptor.mapMethods[mapMethodName] = mapMethodDescriptor;

    mapMethodDescriptor.mappings = this.buildMappingDescriptors(
      mapMethodMetadata.sourceType,
      mapMethodMetadata.targetType,
      mappingsMetadata[mapMethodName] ?? {},
      mapMethodMetadata.ignoreUnknownProperties === true
        ? true
        : mapMethodMetadata.ignoreUnknownProperties === false
        ? false
        : mapperDescriptor.metadata?.ignoreUnknownProperties,
    );

    const addMappings = (targetSources: PropertyTargetSource[]) => {
      for (const targetSource of targetSources) {
        if (mapMethodDescriptor.mappings[targetSource.target]) {
          continue;
        }

        mapMethodDescriptor.mappings[targetSource.target] = {
          target: targetSource.target,
          source: targetSource.source,
          splitSources: getSourcePath(targetSource.source),
          transform: this.options?.propertyMapFn,
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

  private mapHookDescriptors(
    hookMappingDescriptors: ObjectType<HookMappingDescriptor>,
    mapMethodDescriptor: MapMethodDescriptor,
  ) {
    const ret: ObjectType<HookMappingDescriptor> = {};
    const typeCompareFn = this.options.typeCompareFn;

    for (const hookMappingMethodName in hookMappingDescriptors) {
      const hookMappingDescriptor = hookMappingDescriptors[hookMappingMethodName];
      let useHook = false;

      if ('methodName' in hookMappingDescriptor.metadata) {
        if (hookMappingDescriptor.metadata.methodName === mapMethodDescriptor.name) {
          useHook = true;
        }
      } else if ('all' in hookMappingDescriptor.metadata) {
        useHook = true;
      } else if (
        typeCompareFn(mapMethodDescriptor.metadata.targetType, hookMappingDescriptor.metadata.targetType) &&
        typeCompareFn(mapMethodDescriptor.metadata.sourceType, hookMappingDescriptor.metadata.sourceType)
      ) {
        useHook = true;
      }

      if (useHook) {
        ret[hookMappingDescriptor.name] = hookMappingDescriptor;
      }
    }

    return ret;
  }

  private buildHookDescriptors(objectMapperClass: Class, metadataKey: string) {
    const hookMappingsMetadata = (Reflect.getMetadata(metadataKey, objectMapperClass) ?? {}) as ObjectType<MappingHook>;

    const hookMappingDescriptors: ObjectType<BeforeMappingDescriptor> = {};

    for (const mappingMethodName in hookMappingsMetadata) {
      const hookMappingMetadata = hookMappingsMetadata[mappingMethodName];
      hookMappingDescriptors[mappingMethodName] = {
        name: mappingMethodName,
        metadata: hookMappingMetadata,
      };
    }

    return hookMappingDescriptors;
  }

  private buildMappingDescriptors(
    sourceType: Class | undefined,
    targetType: Class | undefined,
    mappingsMetadata: ObjectType<MappingConfig>,
    ignoreUnknownProperties: boolean,
  ) {
    const targetPropertiesMetadata = (targetType ? Reflect.getMetadata(PROPERTY_METADATA, targetType) : {}) as {
      [x: string]: PropertyConfig;
    };

    const sourcePropertiesMetadata = ((sourceType ? Reflect.getMetadata(PROPERTY_METADATA, sourceType) : {}) ?? {}) as {
      [x: string]: PropertyConfig;
    };

    const descriptors: ObjectType<MappingDescriptor> = {};

    const createDescriptor = (
      propertyName: string,
      mappingMetadata: MappingConfig | undefined,
      targetPropertyMetadata: PropertyConfig | undefined,
    ): MappingDescriptor => {
      const source = mappingMetadata?.source ?? propertyName;
      return {
        metadata: mappingMetadata,
        targetPropertyMetadata: targetPropertyMetadata,
        sourcePropertyMetadata: sourcePropertiesMetadata[propertyName],
        target: propertyName,
        source: source,
        splitSources: getSourcePath(source),
        transform: mappingMetadata?.transform ?? this.options?.propertyMapFn,
      };
    };

    for (const propertyName in targetPropertiesMetadata) {
      const mappingMetadata: MappingConfig = mappingsMetadata[propertyName];
      if (mappingMetadata?.ignore) {
        continue;
      }

      const metadata = targetPropertiesMetadata[propertyName] as PropertyConfig;
      descriptors[propertyName] = createDescriptor(propertyName, mappingMetadata, metadata);
    }

    if (!ignoreUnknownProperties) {
      for (const propertyName in mappingsMetadata) {
        const mappingMetadata = mappingsMetadata[propertyName];
        if (mappingMetadata?.ignore) {
          continue;
        }

        if (!descriptors[propertyName]) {
          descriptors[propertyName] = createDescriptor(propertyName, mappingMetadata, undefined);
        }
      }
    }

    return descriptors;
  }

  private buildUsesMappers(mapperMetadata: MapperConfig, mapperDescriptor: MapperDescriptor) {
    for (const mapper of mapperMetadata?.uses ?? []) {
      if (mapper === mapperDescriptor.type) {
        throw new TypeError(`Can not use ${mapper.name} as a dependency of itself`);
      }
      mapperDescriptor.uses.push(this.buildMapperDescriptor(mapper));
    }
  }

  private buildInjectDecorators(objectMapperClass: Class, mapperDescriptor: MapperDescriptor) {
    const injectsMetadata = (Reflect.getMetadata(INJECT_METADATA, objectMapperClass) ?? {}) as ObjectType<InjectConfig>;
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

  private fillMapperDescriptorForInjectDescriptor(mapperDescriptor: MapperDescriptor) {
    for (const injectFieldName in mapperDescriptor.injects) {
      const injectDescriptor = mapperDescriptor.injects[injectFieldName];
      injectDescriptor.mapperDescriptor = this.cacheMapperDescriptor.get(injectDescriptor.type);
      if (injectDescriptor.mapperDescriptor) {
        this.fillMapperDescriptorForInjectDescriptor(injectDescriptor.mapperDescriptor);
      }
    }
  }
}
