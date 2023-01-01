import { MappingHook, MappingRawHook } from '../helper/types';
export type BeforeMappingConfig = MappingHook;
type BeforeMappingRawConfig = MappingRawHook;
/**
 * Annotates a method is a hook that will be called before mapping source to target.
 */
export declare function BeforeMapping(beforeMapping?: BeforeMappingRawConfig): MethodDecorator;
export {};
