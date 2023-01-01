import { Class, ObjectType } from '../helper';
import { TargetFactoryFn } from '../function';
export type PropertyTargetSource = {
    target: string;
    source: string;
};
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
type MapWithAnonymousRawType = MapOnlySpecific<(string | PropertyTargetSourceEx)[]> & MapAllExcludes<string[]> & MapAllIncludes<PropertyTargetSourceEx[]>;
type MapWithAnonymousType = MapOnlySpecific<PropertyTargetSource[]> & MapAllExcludes<ObjectType<true>> & MapAllIncludes<PropertyTargetSource[]>;
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
/**
 * Annotates a method is a mapping method that be able to map source value to target value.
 */
export declare function MapMethod(mapMethod: MapMethodRawConfig | Class | Class[] | (string | PropertyTargetSourceEx)[]): PropertyDecorator;
export {};
