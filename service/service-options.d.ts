import { PropertyExtractFn, PropertyMapFn, ProxyMethodFn, TargetFactoryFn, TypeCompareFn } from '../function';
export interface ServiceOptions {
    propertyMapFn?: PropertyMapFn;
    propertyExtractFn?: PropertyExtractFn;
    targetFactoryFn?: TargetFactoryFn;
    typeCompareFn?: TypeCompareFn;
    proxyMethodFn?: ProxyMethodFn;
}
export declare const DEFAULT_SERVICE_OPTIONS: ServiceOptions;
