import { MappingDescriptor } from './mapping.descriptor';
import { ObjectType } from '../helper';
import { TargetFactoryFn } from '../function';
import { MapMethodConfig } from '../decorator';
import { BeforeMappingDescriptor } from './before-mapping.descriptor';
import { AfterMappingDescriptor } from './after-mapping.descriptor';
import { MappingContext } from '../mapping-context';

/**
 * Descriptor for @MapMethod annotation.
 */
export interface MapMethodDescriptor {
  /**
   * Name of the mapping method.
   */
  name: string;

  /**
   * A list of mapping descriptors that will be used to mapping each property of the current mapping method.
   */
  mappings: ObjectType<MappingDescriptor>;

  /**
   * A list of before mapping descriptors that will be used to call before hooks.
   */
  beforeMappingMethods: ObjectType<BeforeMappingDescriptor>;

  /**
   * A list of before mapping descriptors that will be used to call after hooks.
   */
  afterMappingMethods: ObjectType<AfterMappingDescriptor>;

  /**
   * A function to create a target object while mapping source to target.
   */
  targetFactoryFn: TargetFactoryFn;

  /**
   * Main mapping method that will be call while mapping source to target.
   */
  mapFn?: (source: any, context: MappingContext) => any;

  metadata: MapMethodConfig;
}
