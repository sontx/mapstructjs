import { MapperDescriptor } from '../../src/descriptor/mapper.descriptor';
import { Class } from '../../src/helper/types';
import { DefaultInstanceResolveInjector } from '../../src/service/instance-resolve-injector';

test('should inject all resolver to instanceResolve method', () => {
  class MyMapper {}
  class MyMapper1 {}
  class MyMapper2 {}

  const instanceResolverMock = jest.fn().mockImplementation(() => {
    const cache = new Map<Class, Function>();
    return {
      resolve: (descriptor: MapperDescriptor) => {
        return cache.get(descriptor.type)();
      },
      register: (type: Class, factory: Function) => {
        cache.set(type, factory);
      },
    };
  });

  const createDescriptor = (type: Class, uses: MapperDescriptor[]): MapperDescriptor => ({
    mapMethods: {},
    uses: uses,
    metadata: {},
    injects: {},
    type: type,
    instanceResolve: null,
  });

  const descriptor = createDescriptor(MyMapper, [createDescriptor(MyMapper1, [createDescriptor(MyMapper2, [])])]);
  new DefaultInstanceResolveInjector().inject(descriptor, instanceResolverMock());

  expect(descriptor.instanceResolve).toBeInstanceOf(Function);
  expect(descriptor.instanceResolve()).toBeInstanceOf(MyMapper);
  expect(descriptor.uses[0].instanceResolve).toBeInstanceOf(Function);
  expect(descriptor.uses[0].instanceResolve()).toBeInstanceOf(MyMapper1);
  expect(descriptor.uses[0].uses[0].instanceResolve).toBeInstanceOf(Function);
  expect(descriptor.uses[0].uses[0].instanceResolve()).toBeInstanceOf(MyMapper2);
});
