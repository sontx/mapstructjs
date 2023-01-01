"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultMapMethodInjector = void 0;
const service_configurable_1 = require("./service-configurable");
/**
 * Default implementation for {@see MapMethodInjector}.
 */
class DefaultMapMethodInjector extends service_configurable_1.ServiceConfigurable {
    inject(objectMapper, mapperDescriptor) {
        if (!(objectMapper instanceof mapperDescriptor.type)) {
            throw new TypeError(`objectMapper type ${objectMapper.constructor.name} is not an instance of ${mapperDescriptor.type.name}`);
        }
        for (const mapMethodName in mapperDescriptor.mapMethods) {
            this.decorateMapMethod(objectMapper, mapperDescriptor, mapMethodName);
        }
    }
    decorateMapMethod(objectMapper, mapperDescriptor, mapMethodName) {
        const mapMethodDecorator = mapperDescriptor.mapMethods[mapMethodName];
        objectMapper[mapMethodName] = (source, ...args) => {
            const context = {
                source,
                target: null,
                sourceType: mapMethodDecorator.metadata.sourceType,
                targetType: mapMethodDecorator.metadata.targetType,
                arguments: args,
                options: this.options,
                methodDescriptor: mapMethodDecorator,
                getObjectMapper: () => mapperDescriptor.instanceResolve(),
            };
            return mapMethodDecorator.mapFn.call(objectMapper, source, context);
        };
    }
}
exports.DefaultMapMethodInjector = DefaultMapMethodInjector;
//# sourceMappingURL=map-method-injector.js.map