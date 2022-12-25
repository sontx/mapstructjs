import { MAPPING_METADATA } from '../constants';
import { PropertyMapFn } from '../function';

export interface MappingConfig {
  /**
   * Source property name, use 'dot' for nested properties (ex: person.name, person.address.cityName).
   */
  source?: string;

  /**
   * Target property name.
   */
  target: string;

  /**
   * Whether ignore this property while mapping.
   */
  ignore?: boolean;

  /**
   * A custom transformer to transform value of source property to the target property.
   */
  transform?: PropertyMapFn;
}

/**
 * Configure for a specific mapping property from source to target.
 */
export function Mapping(mapping: MappingConfig | string): PropertyDecorator {
  return (target, propertyKey) => {
    const methods = Reflect.getOwnMetadata(MAPPING_METADATA, target.constructor) ?? {};
    const currentMapping =
      typeof mapping === 'object'
        ? {
            ...mapping,
            source: mapping.source ?? mapping.target,
          }
        : {
            target: mapping,
            source: mapping,
          };
    methods[propertyKey] = methods[propertyKey] ?? {};
    methods[propertyKey][currentMapping.target] = currentMapping;
    Reflect.defineMetadata(MAPPING_METADATA, methods, target.constructor);
  };
}
