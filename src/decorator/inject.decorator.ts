import { INJECT_METADATA } from '../constants';
import { Class } from '../helper';

export interface InjectConfig {
  /**
   * Class type that will be instanced and injected to the specific field.
   */
  type: Class;
}

/**
 * Annotates a field that its value will be injected while creating object mapper.
 * If the injected class is another object mapper its mapping method can be used while mapping properties if needed.
 */
export function Inject(inject: InjectConfig | Class): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const props = Reflect.getOwnMetadata(INJECT_METADATA, target.constructor) ?? {};
    props[propertyKey] =
      inject.constructor.name === 'Object' && 'type' in inject
        ? inject
        : {
            type: inject,
          };
    Reflect.defineMetadata(INJECT_METADATA, props, target.constructor);
  };
}
