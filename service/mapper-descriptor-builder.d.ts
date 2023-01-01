import { Class } from '../helper/types';
import { MapperDescriptor } from '../descriptor';
import { ServiceConfigurable } from './service-configurable';
/**
 * Builds {@see MapperDescriptor} from the object mapper class.
 */
export interface MapperDescriptorBuilder {
    build(objectMapperClass: Class): MapperDescriptor;
}
/**
 * Default implementation for {@see MapperDescriptorBuilder} that uses annotations to build descriptors.
 */
export declare class DefaultMapperDescriptorBuilder extends ServiceConfigurable implements MapperDescriptorBuilder {
    private readonly cacheMapperDescriptor;
    build(objectMapperClass: Class): MapperDescriptor;
    private buildMapperDescriptor;
    private buildMapMethodDescriptors;
    private buildMapMethodDescriptor;
    private mapHookDescriptors;
    private buildHookDescriptors;
    private buildMappingDescriptors;
    private buildUsesMappers;
    private buildInjectDecorators;
    private fillMapperDescriptorForInjectDescriptor;
}
