import { PropertyMapFn } from '../function';
import { MappingConfig, PropertyConfig } from '../decorator';
/**
 * Descriptor for @Mapping annotation.
 */
export interface MappingDescriptor {
    /**
     * Target property name.
     */
    target: string;
    /**
     * Source property name or its path (contains 'dot' for nested properties, ex: person.name)
     */
    source: string;
    /**
     * Source property parts that is split by the 'dot'.
     */
    splitSources: string[];
    /**
     * Transforms source property value to target property value.
     */
    transform: PropertyMapFn;
    metadata?: MappingConfig;
    /**
     * Target property config if defined.
     */
    targetPropertyMetadata?: PropertyConfig;
    /**
     * Source property config if defined.
     */
    sourcePropertyMetadata?: PropertyConfig;
}
