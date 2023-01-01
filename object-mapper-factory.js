"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectMapperFactory = void 0;
const service_1 = require("./service");
const precondition_1 = require("./helper/precondition");
function createDefaultOptions(serviceOptions) {
    return {
        mapMethodInjector: new service_1.DefaultMapMethodInjector(serviceOptions),
        usesLinker: new service_1.DefaultMapperUsesLinker(serviceOptions),
        descriptorBuilder: new service_1.DefaultMapperDescriptorBuilder(serviceOptions),
        instanceResolver: new service_1.DefaultInstanceResolver(serviceOptions),
        instanceResolveInjector: new service_1.DefaultInstanceResolveInjector(),
    };
}
/**
 * A factory to create object mapper from its class type.
 */
class ObjectMapperFactory {
    /**
     * Create new factory with service options.
     */
    static withServiceOptions(serviceOptions) {
        const options = createDefaultOptions(serviceOptions);
        return new ObjectMapperFactory(options);
    }
    constructor(options) {
        this.options = Object.assign(Object.assign({}, createDefaultOptions()), (options !== null && options !== void 0 ? options : {}));
    }
    /**
     * Creates object mapper.
     * @param objectMapperClass type of object mapper.
     * @param params the 'arguments' that will be passed to the constructor of the object mapper class while creating new instance.
     */
    create(objectMapperClass, ...params) {
        const { descriptorBuilder, mapMethodInjector, usesLinker, instanceResolver, instanceResolveInjector, debug } = this.options;
        (0, precondition_1.mustBeDefined)(descriptorBuilder, 'descriptorBuilder must be defined');
        (0, precondition_1.mustBeDefined)(usesLinker, 'usesLinker must be defined');
        (0, precondition_1.mustBeDefined)(mapMethodInjector, 'mapMethodInjector must be defined');
        (0, precondition_1.mustBeDefined)(instanceResolver, 'instanceResolver must be defined');
        (0, precondition_1.mustBeDefined)(instanceResolveInjector, 'instanceResolveInjector must be defined');
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
exports.ObjectMapperFactory = ObjectMapperFactory;
//# sourceMappingURL=object-mapper-factory.js.map