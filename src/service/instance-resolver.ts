import { MapperDescriptor } from '../descriptor';
import { Class } from '../helper';
import { TypeCompareFn } from '../function';
import { ServiceConfigurable } from './service-configurable';
import { ServiceOptions } from './service-options';

/**
 * Resolves object mapper instance by its type.
 */
export interface InstanceResolver {
  resolve(descriptor: MapperDescriptor): any;
  register(type: Class, instanceOrFactory: any | Function): void;
  unregister(type: Class);
}

class TypeMap<TData> {
  private readonly baseMap = new Map<number, TData>();
  private readonly intermediaryMap = new Map<Class, number>();
  private freeId = 0;

  constructor(private readonly typeCompareFn: TypeCompareFn) {}

  has(type: Class) {
    const has = this.intermediaryMap.has(type);
    if (!has) {
      this.cacheType(type);
      return this.intermediaryMap.has(type);
    }
    return has;
  }

  get(type: Class): TData {
    const id = this.intermediaryMap.get(type);
    return this.baseMap.get(id);
  }

  set(type: Class, data: TData) {
    const id = this.freeId++;
    this.intermediaryMap.set(type, id);
    this.baseMap.set(id, data);
  }

  delete(type: Class) {
    const deleteAll = (deleteType: Class) => {
      const id = this.intermediaryMap.get(deleteType);
      this.intermediaryMap.delete(deleteType);
      this.baseMap.delete(id);
    };

    const subTypes: Class[] = [];
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

  private cacheType(type: Class) {
    for (const [key, value] of this.intermediaryMap.entries()) {
      if (this.typeCompareFn(key, type)) {
        const data = this.baseMap.get(value);
        this.set(type, data);
        break;
      }
    }
  }
}

type DataType = { instanceOrFactory: any; initialized: boolean };

/**
 * Default implementation for {@see InstanceResolver} that supports matching subclass.
 */
export class DefaultInstanceResolver extends ServiceConfigurable implements InstanceResolver {
  private cachedInstances: TypeMap<DataType>;

  protected onInit(options: ServiceOptions) {
    super.onInit(options);
    this.cachedInstances = new TypeMap<DataType>(options.typeCompareFn);
  }

  resolve(descriptor: MapperDescriptor): any {
    if (!this.cachedInstances.has(descriptor.type)) {
      throw new TypeError(`Can't resolve type ${descriptor.type}`);
    }

    return this.doResolve(descriptor.type, (instance) => {
      for (const injectFieldName in descriptor.injects) {
        const injectDescriptor = descriptor.injects[injectFieldName];

        let injectValue;
        if (injectDescriptor.mapperDescriptor) {
          injectValue = this.resolve(injectDescriptor.mapperDescriptor);
        } else if (this.cachedInstances.has(injectDescriptor.type)) {
          injectValue = this.doResolve(injectDescriptor.type);
        }

        instance[injectDescriptor.name] = injectValue;
      }
    });
  }

  private doResolve(type: Class, doInit?: (instance: any) => void) {
    const data = this.cachedInstances.get(type);
    let finalInstance;
    if (typeof data.instanceOrFactory === 'function') {
      finalInstance = data.instanceOrFactory();
      data.instanceOrFactory = finalInstance;
    } else {
      finalInstance = data.instanceOrFactory;
    }

    if (!data.initialized) {
      doInit?.call(this, finalInstance);
      data.initialized = true;
    }

    return finalInstance;
  }

  register(type: Class, instanceOrFactory: any | Function) {
    if (!this.cachedInstances.has(type)) {
      this.cachedInstances.set(type, {
        instanceOrFactory,
        initialized: false,
      });
    }
  }

  unregister(type: Class) {
    this.cachedInstances.delete(type);
  }
}
