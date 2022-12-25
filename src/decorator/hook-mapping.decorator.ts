import { MappingHook, MappingRawHook } from '../helper/types';

export const DEFAULT_CONFIG: MappingHook = { all: true };

export function extractConfig(config?: MappingRawHook): MappingHook {
  let currentMapping = config ?? DEFAULT_CONFIG;

  if (typeof config === 'string') {
    currentMapping = {
      methodName: config,
    };
  } else if (typeof config === 'boolean' && config) {
    currentMapping = {
      all: true,
    };
  } else if (Array.isArray(config) && config.length >= 2) {
    currentMapping = {
      targetType: config[0],
      sourceType: config[1],
    };
  }

  return currentMapping as MappingHook;
}
