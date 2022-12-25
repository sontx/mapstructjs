import { AFTER_MAPPING_METADATA } from '../constants';
import { MappingHook, MappingRawHook } from '../helper/types';
import { extractConfig } from './hook-mapping.decorator';

export type AfterMappingConfig = MappingHook;
type AfterMappingRawConfig = MappingRawHook;

/**
 * Annotates a method is a hook that will be called after mapping source to target.
 */
export function AfterMapping(afterMapping?: AfterMappingRawConfig): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const methods = Reflect.getOwnMetadata(AFTER_MAPPING_METADATA, target.constructor) ?? {};
    methods[propertyKey] = extractConfig(afterMapping);
    Reflect.defineMetadata(AFTER_MAPPING_METADATA, methods, target.constructor);
    return descriptor;
  };
}
