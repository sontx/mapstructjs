import { MapperDescriptor } from '../descriptor';
import { Class } from '../helper';
import { ServiceConfigurable } from './service-configurable';
import { ServiceOptions } from './service-options';
/**
 * Resolves object mapper instance by its type.
 */
export interface InstanceResolver {
    resolve(descriptor: MapperDescriptor): any;
    register(type: Class, instanceOrFactory: any | Function): void;
    unregister(type: Class): any;
}
/**
 * Default implementation for {@see InstanceResolver} that supports matching subclass.
 */
export declare class DefaultInstanceResolver extends ServiceConfigurable implements InstanceResolver {
    private cachedInstances;
    protected onInit(options: ServiceOptions): void;
    resolve(descriptor: MapperDescriptor): any;
    private doResolve;
    register(type: Class, instanceOrFactory: any | Function): void;
    unregister(type: Class): void;
}
