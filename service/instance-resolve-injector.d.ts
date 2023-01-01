import { MapperDescriptor } from '../descriptor';
import { InstanceResolver } from './instance-resolver';
/**
 * Implements instanceResolve method for {@see MapperDescriptor.instanceResolve}
 */
export interface InstanceResolveInjector {
    inject(mapperDescriptor: MapperDescriptor, instanceResolver: InstanceResolver): void;
}
/**
 * Default implementation for {@see InstanceResolveInjector} that uses {@see InstanceResolver} to resolve object mapper instance.
 */
export declare class DefaultInstanceResolveInjector implements InstanceResolveInjector {
    inject(mapperDescriptor: MapperDescriptor, instanceResolver: InstanceResolver): void;
}
