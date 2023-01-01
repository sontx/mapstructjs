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
export declare function Inject(inject: InjectConfig | Class): PropertyDecorator;
