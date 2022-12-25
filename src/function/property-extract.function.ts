/**
 * Extracts value from an object by its path.
 */
export type PropertyExtractFn = (prop: object, rawPath: string, splitPaths: string[]) => any;

/**
 * Default implementation for {@see PropertyExtractFn} that supports nested properties by specify 'dot' between levels.
 */
export const DEFAULT_PROPERTY_EXTRACT_FN: PropertyExtractFn = (prop: object, rawPath: string, splitPaths: string[]) => {
  if (typeof prop !== 'object' || !prop) {
    return undefined;
  }

  if (splitPaths.length === 0) {
    return prop;
  }

  if (splitPaths.length <= 1) {
    return typeof prop === 'object' && prop ? prop[rawPath] : undefined;
  }

  let propVal = prop;
  for (const splitPath of splitPaths) {
    if (typeof propVal !== 'object') {
      return undefined;
    }
    propVal = propVal[splitPath];
  }

  return propVal;
};
