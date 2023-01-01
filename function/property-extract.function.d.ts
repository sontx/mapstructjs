/**
 * Extracts value from an object by its path.
 */
export type PropertyExtractFn = (prop: object, rawPath: string, splitPaths: string[]) => any;
/**
 * Default implementation for {@see PropertyExtractFn} that supports nested properties by specify 'dot' between levels.
 */
export declare const DEFAULT_PROPERTY_EXTRACT_FN: PropertyExtractFn;
