import { MAP_METHOD_METADATA } from '../constants';
import { Class, ObjectType } from '../helper';
import { TargetFactoryFn } from '../function';
import { isEmptyObject } from '../helper/utils';

export type PropertyTargetSource = { target: string; source: string };
type PropertyTargetSourceEx = string[] | PropertyTargetSource;

interface MapMethodBase {
  /**
   * A factory to create target object from its type.
   */
  targetFactoryFn?: TargetFactoryFn;
  /**
   * Whether using this exact map method to do mapping, otherwise uses linked map method if needed.
   */
  exact?: boolean;
}

/**
 * Mapping all properties from source to target but excluding specific properties.
 */
interface MapAllExcludes<TProps> extends MapMethodBase {
  /**
   * Mapping all properties but excludes these one.
   */
  excludes: TProps;
}

/**
 * Mapping all properties from source to target and also including additional properties.
 */
interface MapAllIncludes<TProps> extends MapMethodBase {
  /**
   * Mapping all properties and also includes these one.
   */
  includes: TProps;
}

/**
 * Only mapping specific properties from source to target
 */
interface MapOnlySpecific<TProps> extends MapMethodBase {
  /**
   * Only mapping these properties.
   */
  properties: TProps;
}

type MapWithAnonymousRawType = MapOnlySpecific<(string | PropertyTargetSourceEx)[]> &
  MapAllExcludes<string[]> &
  MapAllIncludes<PropertyTargetSourceEx[]>;

type MapWithAnonymousType = MapOnlySpecific<PropertyTargetSource[]> &
  MapAllExcludes<ObjectType<true>> &
  MapAllIncludes<PropertyTargetSource[]>;

/**
 * Mapping properties that either defined by @Property or @Mapping.
 */
interface MapWithType extends MapMethodBase {
  sourceType?: Class;
  targetType: Class;
  /**
   * Whether using @Mapping properties that don't have appropriate @Property properties to do mapping.
   */
  ignoreUnknownProperties?: boolean;
}

export type MapMethodConfig = Partial<MapWithType & MapWithAnonymousType>;
export type MapMethodRawConfig = Partial<MapWithType & MapWithAnonymousRawType>;

function convertToPropertyTargetSource(rawType: string | PropertyTargetSourceEx): PropertyTargetSource | undefined {
  if (typeof rawType === 'string') {
    return { target: rawType, source: rawType };
  }

  if (Array.isArray(rawType)) {
    if (rawType.length >= 1) {
      return { target: rawType[0], source: rawType[1] ?? rawType[0] };
    }
  } else {
    return rawType;
  }

  return undefined;
}

function convertToPropertyTargetSources(
  rawTypes: (string | PropertyTargetSourceEx)[] | undefined,
): PropertyTargetSource[] | undefined {
  if (!rawTypes) {
    return undefined;
  }
  return rawTypes.map((rawType) => convertToPropertyTargetSource(rawType)).filter(Boolean);
}

/**
 * Annotates a method is a mapping method that be able to map source value to target value.
 */
export function MapMethod(
  mapMethod: MapMethodRawConfig | Class | Class[] | (string | PropertyTargetSourceEx)[],
): PropertyDecorator {
  let normalizedMapMethod: MapMethodConfig;
  if (typeof mapMethod === 'object') {
    if (isEmptyObject(mapMethod)) {
      throw new TypeError('Map method config must not be empty');
    }

    if (Array.isArray(mapMethod)) {
      if (typeof mapMethod[0] === 'function') {
        normalizedMapMethod = {
          targetType: mapMethod[0],
          sourceType: mapMethod[1] as Class,
        };
      } else {
        normalizedMapMethod = {
          properties: convertToPropertyTargetSources(mapMethod as any),
        };
      }
    } else {
      const anonymousConfigs = [mapMethod.includes, mapMethod.excludes, mapMethod.properties].filter(Boolean);
      if (anonymousConfigs.length > 1 || (anonymousConfigs.length === 1 && mapMethod.targetType)) {
        throw new TypeError('Only one includes, excludes, properties or targetType is allowed to define');
      }

      normalizedMapMethod = {
        ...mapMethod,
        includes: convertToPropertyTargetSources(mapMethod.includes),
        excludes: convertToPropertyTargetSources(mapMethod.excludes)?.reduce((prev, curr) => {
          prev[curr.target] = true;
          return prev;
        }, {} as ObjectType<true>),
        properties: convertToPropertyTargetSources(mapMethod.properties),
      };
    }
  } else {
    normalizedMapMethod = {
      targetType: mapMethod,
    };
  }

  if (
    normalizedMapMethod.sourceType === normalizedMapMethod.targetType &&
    normalizedMapMethod.sourceType &&
    normalizedMapMethod.targetType
  ) {
    throw new TypeError('Source type and target type must not be the same');
  }

  return (target, propertyKey) => {
    const methods = Reflect.getOwnMetadata(MAP_METHOD_METADATA, target.constructor) ?? {};
    methods[propertyKey] = normalizedMapMethod;
    Reflect.defineMetadata(MAP_METHOD_METADATA, methods, target.constructor);
  };
}
