import { Class } from '../helper';
import { isSubclassOf } from '../helper/utils';

/**
 * Compares two types are equal or not.
 */
export type TypeCompareFn = (type1: Class, type2: Class) => boolean;

/**
 * Default implementation for {@see TypeCompareFn} that supports for comparing subclasses.
 */
export const DEFAULT_TYPE_COMPARE_FN: TypeCompareFn = (type1, type2) => type1 === type2 || isSubclassOf(type1, type2);
