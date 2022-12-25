import { InjectConfig } from '../decorator';
import { Class } from '../helper';
import { MapperDescriptor } from './mapper.descriptor';

/**
 * Descriptor for @Inject annotation.
 */
export interface InjectDescriptor {
  /**
   * Injected field name.
   */
  name: string;

  /**
   * Injected field class type.
   */
  type: Class;

  /**
   * The parent mapper descriptor if it's a valid object mapper.
   */
  mapperDescriptor?: MapperDescriptor;

  metadata: InjectConfig;
}
