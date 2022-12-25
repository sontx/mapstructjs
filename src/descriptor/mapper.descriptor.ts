import { Class, ObjectType } from '../helper';
import { MapMethodDescriptor } from './map-method.descriptor';
import { MapperConfig } from '../decorator';
import { InjectDescriptor } from './inject.descriptor';

/**
 * Descriptor for @Mapper annotation.
 */
export interface MapperDescriptor {
  /**
   * Object mapper class type.
   */
  type: Class;

  /**
   * A list of linked services that can be other object mappers or even a normal class.
   */
  uses: MapperDescriptor[];

  /**
   * A list of mapping methods that defined inside the current object mapper.
   */
  mapMethods: ObjectType<MapMethodDescriptor>;

  /**
   * Injected fields.
   */
  injects: ObjectType<InjectDescriptor>;

  /**
   * A factory that resolves the instance of the current object mapper.
   */
  instanceResolve: () => any;

  metadata: MapperConfig;
}
