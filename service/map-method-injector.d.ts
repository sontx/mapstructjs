import { MapperDescriptor } from '../descriptor';
import { ServiceConfigurable } from './service-configurable';
/**
 * Injects implementation for the mapping method.
 */
export interface MapMethodInjector {
    inject(objectMapper: object, mapperDescriptor: MapperDescriptor): any;
}
/**
 * Default implementation for {@see MapMethodInjector}.
 */
export declare class DefaultMapMethodInjector extends ServiceConfigurable implements MapMethodInjector {
    inject(objectMapper: object, mapperDescriptor: MapperDescriptor): void;
    private decorateMapMethod;
}
