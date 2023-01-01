"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultInstanceResolver = void 0;
const service_configurable_1 = require("./service-configurable");
class TypeMap {
    constructor(typeCompareFn) {
        this.typeCompareFn = typeCompareFn;
        this.baseMap = new Map();
        this.intermediaryMap = new Map();
        this.freeId = 0;
    }
    has(type) {
        const has = this.intermediaryMap.has(type);
        if (!has) {
            this.cacheType(type);
            return this.intermediaryMap.has(type);
        }
        return has;
    }
    get(type) {
        const id = this.intermediaryMap.get(type);
        return this.baseMap.get(id);
    }
    set(type, data) {
        const id = this.freeId++;
        this.intermediaryMap.set(type, id);
        this.baseMap.set(id, data);
    }
    delete(type) {
        const deleteAll = (deleteType) => {
            const id = this.intermediaryMap.get(deleteType);
            this.intermediaryMap.delete(deleteType);
            this.baseMap.delete(id);
        };
        const subTypes = [];
        for (const [key] of this.intermediaryMap.entries()) {
            if (this.typeCompareFn(key, type)) {
                subTypes.push(key);
            }
        }
        subTypes.forEach((subType) => {
            deleteAll(subType);
        });
        deleteAll(type);
    }
    cacheType(type) {
        for (const [key, value] of this.intermediaryMap.entries()) {
            if (this.typeCompareFn(key, type)) {
                const data = this.baseMap.get(value);
                this.set(type, data);
                break;
            }
        }
    }
}
/**
 * Default implementation for {@see InstanceResolver} that supports matching subclass.
 */
class DefaultInstanceResolver extends service_configurable_1.ServiceConfigurable {
    onInit(options) {
        super.onInit(options);
        this.cachedInstances = new TypeMap(options.typeCompareFn);
    }
    resolve(descriptor) {
        if (!this.cachedInstances.has(descriptor.type)) {
            throw new TypeError(`Can't resolve type ${descriptor.type}`);
        }
        return this.doResolve(descriptor.type, (instance) => {
            for (const injectFieldName in descriptor.injects) {
                const injectDescriptor = descriptor.injects[injectFieldName];
                let injectValue;
                if (injectDescriptor.mapperDescriptor) {
                    injectValue = this.resolve(injectDescriptor.mapperDescriptor);
                }
                else if (this.cachedInstances.has(injectDescriptor.type)) {
                    injectValue = this.doResolve(injectDescriptor.type);
                }
                instance[injectDescriptor.name] = injectValue;
            }
        });
    }
    doResolve(type, doInit) {
        const data = this.cachedInstances.get(type);
        let finalInstance;
        if (typeof data.instanceOrFactory === 'function') {
            finalInstance = data.instanceOrFactory();
            data.instanceOrFactory = finalInstance;
        }
        else {
            finalInstance = data.instanceOrFactory;
        }
        if (!data.initialized) {
            doInit === null || doInit === void 0 ? void 0 : doInit.call(this, finalInstance);
            data.initialized = true;
        }
        return finalInstance;
    }
    register(type, instanceOrFactory) {
        if (!this.cachedInstances.has(type)) {
            this.cachedInstances.set(type, {
                instanceOrFactory,
                initialized: false,
            });
        }
    }
    unregister(type) {
        this.cachedInstances.delete(type);
    }
}
exports.DefaultInstanceResolver = DefaultInstanceResolver;
//# sourceMappingURL=instance-resolver.js.map