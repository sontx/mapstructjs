import { MappingContext } from '../mapping-context';
/**
 * The implementation for mapping method that does mapping and handling lifecycle things.
 */
export type ProxyMethodFn = (source: object, mappingContext: MappingContext) => any;
/**
 * Default implementation for {@see ProxyMethodFn} that supports before and after hooks.
 */
export declare const DEFAULT_PROXY_METHOD_FN: ProxyMethodFn;
