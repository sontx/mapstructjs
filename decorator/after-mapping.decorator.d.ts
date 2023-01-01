import { MappingHook, MappingRawHook } from '../helper/types';
export type AfterMappingConfig = MappingHook;
type AfterMappingRawConfig = MappingRawHook;
/**
 * Annotates a method is a hook that will be called after mapping source to target.
 */
export declare function AfterMapping(afterMapping?: AfterMappingRawConfig): MethodDecorator;
export {};
