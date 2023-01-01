import { MappingHook } from '../helper/types';
export interface HookMappingDescriptor {
    /**
     * Method name that is annotated with @MapMethod and will trigger this hook.
     */
    name: string;
    metadata: MappingHook;
}
