import { Class } from '../helper';
import { MappingContext } from '../descriptor';

/**
 * Creates target object from its type.
 */
export type TargetFactoryFn = (
  targetType: Class | undefined | null,
  mappingContext: MappingContext,
) => InstanceType<Class>;

/**
 * Default implementation for {@see TargetFactoryFn} that calls 'new' keyword to instance the target object.
 */
export const DEFAULT_TARGET_FACTORY_FN: TargetFactoryFn = (
  targetType: Class | undefined | null,
  mappingContext: MappingContext,
): InstanceType<Class> => {
  return targetType ? new targetType(...mappingContext.arguments) : {};
};
