import { PROPERTY_METADATA } from '../constants';
import 'reflect-metadata';
import { Class } from '../helper';

export interface PropertyConfig {
  /**
   * Property type, that is useful when linking with other object mappers.
   */
  type?: Class;
}

export const DEFAULT_CONFIG: PropertyConfig = {};

/**
 * Annotates a field is a mapping property, that can be either source property or target property.
 * This annotation is not always required to define a mapping property.
 */
export function Property(property?: PropertyConfig | Class): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const props = Reflect.getOwnMetadata(PROPERTY_METADATA, target.constructor) ?? {};
    props[propertyKey] = property
      ? property.constructor.name === 'Object' && 'type' in property
        ? property
        : {
            type: property,
          }
      : DEFAULT_CONFIG;
    Reflect.defineMetadata(PROPERTY_METADATA, props, target.constructor);
  };
}
