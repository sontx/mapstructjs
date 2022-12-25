import { Class } from './helper';
import {
  DefaultInstanceResolveInjector,
  DefaultInstanceResolver,
  DefaultMapMethodInjector,
  DefaultMapperDescriptorBuilder,
  DefaultMapperUsesLinker,
  InstanceResolveInjector,
  InstanceResolver,
  MapMethodInjector,
  MapperDescriptorBuilder,
  MapperUsesLinker,
  ServiceOptions,
} from './service';
import { mustBeDefined } from './helper/precondition';

export interface ObjectMapperFactoryOptions {
  descriptorBuilder?: MapperDescriptorBuilder;
  usesLinker?: MapperUsesLinker;
  mapMethodInjector?: MapMethodInjector;
  instanceResolver?: InstanceResolver;
  instanceResolveInjector?: InstanceResolveInjector;
  debug?: boolean;
}

function createDefaultOptions(serviceOptions?: ServiceOptions): ObjectMapperFactoryOptions {
  return {
    mapMethodInjector: new DefaultMapMethodInjector(serviceOptions),
    usesLinker: new DefaultMapperUsesLinker(serviceOptions),
    descriptorBuilder: new DefaultMapperDescriptorBuilder(serviceOptions),
    instanceResolver: new DefaultInstanceResolver(serviceOptions),
    instanceResolveInjector: new DefaultInstanceResolveInjector(),
  };
}

/**
 * A factory to create object mapper from its class type.
 */
export class ObjectMapperFactory {
  /**
   * Create new factory with service options.
   */
  static withServiceOptions(serviceOptions: ServiceOptions) {
    const options = createDefaultOptions(serviceOptions);
    return new ObjectMapperFactory(options);
  }

  readonly options: ObjectMapperFactoryOptions;

  constructor(options?: ObjectMapperFactoryOptions) {
    this.options = {
      ...createDefaultOptions(),
      ...(options ?? {}),
    };
  }

  /**
   * Creates object mapper.
   * @param objectMapperClass type of object mapper.
   * @param params the 'arguments' that will be passed to the constructor of the object mapper class while creating new instance.
   */
  create<TObjectMapper extends Class>(objectMapperClass: TObjectMapper, ...params: any[]): InstanceType<TObjectMapper> {
    const { descriptorBuilder, mapMethodInjector, usesLinker, instanceResolver, instanceResolveInjector, debug } =
      this.options;

    mustBeDefined(descriptorBuilder, 'descriptorBuilder must be defined');
    mustBeDefined(usesLinker, 'usesLinker must be defined');
    mustBeDefined(mapMethodInjector, 'mapMethodInjector must be defined');
    mustBeDefined(instanceResolver, 'instanceResolver must be defined');
    mustBeDefined(instanceResolveInjector, 'instanceResolveInjector must be defined');

    const objectMapper = new objectMapperClass(...params);
    instanceResolver.register(objectMapperClass, objectMapper);

    const mapperDescriptor = descriptorBuilder.build(objectMapperClass);

    instanceResolveInjector.inject(mapperDescriptor, instanceResolver);
    usesLinker.link(mapperDescriptor);
    mapMethodInjector.inject(objectMapper, mapperDescriptor);

    if (debug) {
      objectMapper.__descriptor__ = mapperDescriptor;
    }

    return objectMapper;
  }
}
