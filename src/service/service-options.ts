import {
  DEFAULT_PROPERTY_EXTRACT_FN,
  DEFAULT_PROPERTY_MAP_FN,
  DEFAULT_PROXY_METHOD_FN,
  DEFAULT_TARGET_FACTORY_FN,
  DEFAULT_TYPE_COMPARE_FN,
  PropertyExtractFn,
  PropertyMapFn,
  ProxyMethodFn,
  TargetFactoryFn,
  TypeCompareFn,
} from '../function';

export interface ServiceOptions {
  propertyMapFn?: PropertyMapFn;
  propertyExtractFn?: PropertyExtractFn;
  targetFactoryFn?: TargetFactoryFn;
  typeCompareFn?: TypeCompareFn;
  proxyMethodFn?: ProxyMethodFn;
}

export const DEFAULT_SERVICE_OPTIONS: ServiceOptions = {
  propertyMapFn: DEFAULT_PROPERTY_MAP_FN,
  propertyExtractFn: DEFAULT_PROPERTY_EXTRACT_FN,
  targetFactoryFn: DEFAULT_TARGET_FACTORY_FN,
  typeCompareFn: DEFAULT_TYPE_COMPARE_FN,
  proxyMethodFn: DEFAULT_PROXY_METHOD_FN,
};
