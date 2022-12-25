import { Class } from './helper';
import { ServiceOptions } from './service';
import { MapMethodDescriptor } from './descriptor';

/**
 * Mapping context for current mapping method.
 */
export interface MappingContext {
  /**
   * Source object.
   */
  source: any;

  /**
   * Target object.
   */
  target: any;

  /**
   * Source type if defined.
   */
  sourceType?: Class;

  /**
   * Target type if defined.
   */
  targetType?: Class;

  /**
   * The rest arguments that passing to the mapping method.
   * The first argument is always the source object.
   */
  arguments: any[];

  /**
   * Resolves the current object mapper instance.
   */
  getObjectMapper<T = any>(): T;

  options: ServiceOptions;
  methodDescriptor: MapMethodDescriptor;

  /**
   * The previous context in case the calling is from the other object mapper.
   */
  previousContext?: MappingContext;
}
