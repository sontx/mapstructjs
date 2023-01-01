import { BeforeMappingConfig } from '../decorator';
export type Class = {
    new (...args: any[]): any;
};
export type ObjectType<T> = {
    [x: string]: T;
};
/**
 * Only matches specific source type and target type
 */
type ForMappingType = {
    sourceType: Class;
    targetType: Class;
};
/**
 * Only matches specific mapping method name
 */
type ForMappingMethod = {
    methodName: string;
};
/**
 * Matches for all mapping methods
 */
type ForAllMappingMethod = {
    all: true;
};
export type MappingHook = ForMappingType | ForMappingMethod | ForAllMappingMethod;
export type MappingRawHook = BeforeMappingConfig | string | true | Class[];
export {};
