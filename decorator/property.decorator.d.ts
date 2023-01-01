import 'reflect-metadata';
import { Class } from '../helper';
export interface PropertyConfig {
    /**
     * Property type, that is useful when linking with other object mappers.
     */
    type?: Class;
}
export declare const DEFAULT_CONFIG: PropertyConfig;
/**
 * Annotates a field is a mapping property, that can be either source property or target property.
 * This annotation is not always required to define a mapping property.
 */
export declare function Property(property?: PropertyConfig | Class): PropertyDecorator;
