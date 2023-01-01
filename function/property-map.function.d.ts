import { MappingContext } from '../descriptor';
/**
 * Maps source value to target value.
 */
export type PropertyMapFn = (sourceValue: any, context: MappingContext) => any;
/**
 * Default implementation for {@see PropertyMapFn} that just returns exact source value.
 */
export declare const DEFAULT_PROPERTY_MAP_FN: PropertyMapFn;
