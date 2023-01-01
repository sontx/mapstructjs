import { Class } from '../helper';
/**
 * Compares two types are equal or not.
 */
export type TypeCompareFn = (type1: Class, type2: Class) => boolean;
/**
 * Default implementation for {@see TypeCompareFn} that supports for comparing subclasses.
 */
export declare const DEFAULT_TYPE_COMPARE_FN: TypeCompareFn;
