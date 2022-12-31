import { BEFORE_MAPPING_METADATA } from '../constants';
import { MappingHook, MappingRawHook } from '../helper/types';
import { extractConfig } from './hook-mapping.decorator';

export type BeforeMappingConfig = MappingHook;
type BeforeMappingRawConfig = MappingRawHook;

/**
 * Annotates a method is a hook that will be called before mapping source to target.
 */
export function BeforeMapping(beforeMapping?: BeforeMappingRawConfig): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const methods = Reflect.getOwnMetadata(BEFORE_MAPPING_METADATA, target.constructor) ?? {};
    methods[propertyKey] = extractConfig(beforeMapping);
    Reflect.defineMetadata(BEFORE_MAPPING_METADATA, methods, target.constructor);
    return descriptor;
  };
}
