import { MAPPER_METADATA } from '../constants';
import { Class } from '../helper';

export interface MapperConfig {
  /**
   * Specify this object mapper is using other classes (ex: use another object mapper to map a specific property).
   */
  uses?: Class[];

  /**
   * Whether using @Mapping properties that don't have appropriate @Property properties to do mapping.
   */
  ignoreUnknownProperties?: boolean;
}

export const DEFAULT_CONFIG: MapperConfig = {};

/**
 * Annotates a class is a object mapper. This annotation is not always required to define a object mapper.
 */
export function Mapper(mapper?: MapperConfig | Class[]): ClassDecorator {
  return (target) => {
    const currentMapper = mapper && Array.isArray(mapper) ? { uses: mapper } : mapper;
    Reflect.defineMetadata(MAPPER_METADATA, currentMapper ?? DEFAULT_CONFIG, target);
  };
}
