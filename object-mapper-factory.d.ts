import { Class } from './helper';
import { InstanceResolveInjector, InstanceResolver, MapMethodInjector, MapperDescriptorBuilder, MapperUsesLinker, ServiceOptions } from './service';
export interface ObjectMapperFactoryOptions {
    descriptorBuilder?: MapperDescriptorBuilder;
    usesLinker?: MapperUsesLinker;
    mapMethodInjector?: MapMethodInjector;
    instanceResolver?: InstanceResolver;
    instanceResolveInjector?: InstanceResolveInjector;
    debug?: boolean;
}
/**
 * A factory to create object mapper from its class type.
 */
export declare class ObjectMapperFactory {
    /**
     * Create new factory with service options.
     */
    static withServiceOptions(serviceOptions: ServiceOptions): ObjectMapperFactory;
    readonly options: ObjectMapperFactoryOptions;
    constructor(options?: ObjectMapperFactoryOptions);
    /**
     * Creates object mapper.
     * @param objectMapperClass type of object mapper.
     * @param params the 'arguments' that will be passed to the constructor of the object mapper class while creating new instance.
     */
    create<TObjectMapper extends Class>(objectMapperClass: TObjectMapper, ...params: any[]): InstanceType<TObjectMapper>;
}
