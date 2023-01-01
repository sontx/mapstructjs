"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultInstanceResolveInjector = void 0;
/**
 * Default implementation for {@see InstanceResolveInjector} that uses {@see InstanceResolver} to resolve object mapper instance.
 */
class DefaultInstanceResolveInjector {
    inject(mapperDescriptor, instanceResolver) {
        instanceResolver.register(mapperDescriptor.type, () => new mapperDescriptor.type());
        mapperDescriptor.instanceResolve = () => instanceResolver.resolve(mapperDescriptor);
        for (const useMapper of mapperDescriptor.uses) {
            this.inject(useMapper, instanceResolver);
        }
    }
}
exports.DefaultInstanceResolveInjector = DefaultInstanceResolveInjector;
//# sourceMappingURL=instance-resolve-injector.js.map