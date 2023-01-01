import { MapperDescriptor } from '../descriptor';
import { ServiceConfigurable } from './service-configurable';
/**
 * Links mapping properties with other object mappers if source type and target type are both matched from the current
 * mapping property and other object mapper's mapping method.
 */
export interface MapperUsesLinker {
    link(mapperDescriptor: MapperDescriptor): any;
}
/**
 * Default implementation for {@see MapperUsesLinker} that supports for matching subclasses of source type and target type.
 */
export declare class DefaultMapperUsesLinker extends ServiceConfigurable implements MapperUsesLinker {
    link(mapperDescriptor: MapperDescriptor): void;
    private buildMapMethodGraph;
    private linkUsesMapperDescriptors;
}
