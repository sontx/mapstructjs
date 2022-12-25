import { MapperDescriptor } from '../descriptor';
import { MappingContext } from '../descriptor';
import { ServiceConfigurable } from './service-configurable';

/**
 * Injects implementation for the mapping method.
 */
export interface MapMethodInjector {
  inject(objectMapper: object, mapperDescriptor: MapperDescriptor);
}

/**
 * Default implementation for {@see MapMethodInjector}.
 */
export class DefaultMapMethodInjector extends ServiceConfigurable implements MapMethodInjector {
  inject(objectMapper: object, mapperDescriptor: MapperDescriptor) {
    if (!(objectMapper instanceof mapperDescriptor.type)) {
      throw new TypeError(
        `objectMapper type ${objectMapper.constructor.name} is not an instance of ${mapperDescriptor.type.name}`,
      );
    }

    for (const mapMethodName in mapperDescriptor.mapMethods) {
      this.decorateMapMethod(objectMapper, mapperDescriptor, mapMethodName);
    }
  }

  private decorateMapMethod(objectMapper: object, mapperDescriptor: MapperDescriptor, mapMethodName: string) {
    const mapMethodDecorator = mapperDescriptor.mapMethods[mapMethodName];
    objectMapper[mapMethodName] = (source, ...args) => {
      const context: MappingContext = {
        source,
        target: null,
        sourceType: mapMethodDecorator.metadata.sourceType,
        targetType: mapMethodDecorator.metadata.targetType,
        arguments: args,
        options: this.options,
        methodDescriptor: mapMethodDecorator,
        getObjectMapper: () => mapperDescriptor.instanceResolve(),
      };
      return mapMethodDecorator.mapFn.call(objectMapper, source, context);
    };
  }
}
