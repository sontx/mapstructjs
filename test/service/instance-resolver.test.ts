import { DefaultInstanceResolver, InstanceResolver } from '../../src/service/instance-resolver';
import { Class, ObjectType } from '../../src/helper/types';
import { MapperDescriptor } from '../../src/descriptor/mapper.descriptor';
import { InjectDescriptor } from '../../src/descriptor/inject.descriptor';

let instanceResolver: InstanceResolver;

const getMapperDescriptor = (type: Class, injects: ObjectType<InjectDescriptor>): MapperDescriptor => ({
  type,
  injects,
  uses: [],
  mapMethods: {},
  metadata: null,
  instanceResolve: null,
});

beforeEach(() => {
  instanceResolver = new DefaultInstanceResolver();
});

test('can resolve from registered type with an pre-created instance', () => {
  class Test {}
  const descriptor = getMapperDescriptor(Test, {});
  const preCreateInstance = new Test();
  instanceResolver.register(Test, preCreateInstance);
  const resolvedInstance = instanceResolver.resolve(descriptor);
  expect(resolvedInstance).toBe(preCreateInstance);
});

test('can resolve from registered type with a factory', () => {
  class Test {}
  const descriptor = getMapperDescriptor(Test, {});
  instanceResolver.register(Test, () => new Test());
  const resolvedInstance = instanceResolver.resolve(descriptor);
  expect(resolvedInstance).toBeInstanceOf(Test);
});

test('can not resolve type that was not registered', () => {
  class Test {}
  const descriptor = getMapperDescriptor(Test, {});
  expect(() => instanceResolver.resolve(descriptor)).toThrow(TypeError);
});

test('can not resolve type that was unregistered', () => {
  class Test {}
  const descriptor = getMapperDescriptor(Test, {});

  instanceResolver.register(Test, () => new Test());
  instanceResolver.unregister(Test);

  expect(() => instanceResolver.resolve(descriptor)).toThrow(TypeError);
});

test('can resolve injected fields with correct config', () => {
  class InjectMe1 {}
  class InjectMe2 {}
  class Test {}

  const descriptor = getMapperDescriptor(Test, {
    inject1: {
      name: 'inject1',
      type: InjectMe1,
      metadata: { type: InjectMe1 },
    },
    inject2: {
      name: 'inject2',
      type: InjectMe2,
      metadata: { type: InjectMe2 },
    },
  });

  instanceResolver.register(InjectMe1, () => new InjectMe1());
  instanceResolver.register(InjectMe2, () => new InjectMe2());
  instanceResolver.register(Test, () => new Test());

  const resolvedInstance = instanceResolver.resolve(descriptor);
  expect(resolvedInstance).toBeInstanceOf(Test);
  expect(resolvedInstance.inject1).toBeInstanceOf(InjectMe1);
  expect(resolvedInstance.inject2).toBeInstanceOf(InjectMe2);
});

test('can resolve nested injected fields with correct config', () => {
  class NestedInjectMe1 {}
  class InjectMe1 {}
  class InjectMe2 {}
  class Test {}

  const nestedDescriptor = getMapperDescriptor(InjectMe1, {});
  nestedDescriptor.injects = {
    nestedInject: {
      name: 'nestedInject',
      type: NestedInjectMe1,
      metadata: { type: NestedInjectMe1 },
    },
  };

  const descriptor = getMapperDescriptor(Test, {
    inject1: {
      name: 'inject1',
      type: InjectMe1,
      mapperDescriptor: nestedDescriptor,
      metadata: { type: InjectMe1 },
    },
    inject2: {
      name: 'inject2',
      type: InjectMe2,
      metadata: { type: InjectMe2 },
    },
  });

  instanceResolver.register(NestedInjectMe1, () => new NestedInjectMe1());
  instanceResolver.register(InjectMe1, () => new InjectMe1());
  instanceResolver.register(InjectMe2, () => new InjectMe2());
  instanceResolver.register(Test, () => new Test());

  const resolvedInstance = instanceResolver.resolve(descriptor);
  expect(resolvedInstance).toBeInstanceOf(Test);
  expect(resolvedInstance.inject1).toBeInstanceOf(InjectMe1);
  expect(resolvedInstance.inject2).toBeInstanceOf(InjectMe2);
  expect(resolvedInstance.inject1.nestedInject).toBeInstanceOf(NestedInjectMe1);
});

test('without register injected types then inject undefined to fields', () => {
  class InjectMe1 {}
  class InjectMe2 {}
  class Test {}

  const descriptor = getMapperDescriptor(Test, {
    inject1: {
      name: 'inject1',
      type: InjectMe1,
      metadata: { type: InjectMe1 },
    },
    inject2: {
      name: 'inject2',
      type: InjectMe2,
      metadata: { type: InjectMe2 },
    },
  });

  instanceResolver.register(Test, () => new Test());

  const resolvedInstance = instanceResolver.resolve(descriptor);
  expect(resolvedInstance).toBeInstanceOf(Test);
  expect(resolvedInstance.inject1).toBeUndefined();
  expect(resolvedInstance.inject2).toBeUndefined();
});

test('without register nested injected types then inject undefined to fields', () => {
  class NestedInjectMe1 {}
  class InjectMe1 {}
  class InjectMe2 {}
  class Test {}

  const nestedDescriptor = getMapperDescriptor(InjectMe1, {});
  nestedDescriptor.injects = {
    nestedInject: {
      name: 'nestedInject',
      type: NestedInjectMe1,
      metadata: { type: NestedInjectMe1 },
    },
  };

  const descriptor = getMapperDescriptor(Test, {
    inject1: {
      name: 'inject1',
      type: InjectMe1,
      mapperDescriptor: nestedDescriptor,
      metadata: { type: InjectMe1 },
    },
    inject2: {
      name: 'inject2',
      type: InjectMe2,
      metadata: { type: InjectMe2 },
    },
  });

  instanceResolver.register(InjectMe1, () => new InjectMe1());
  instanceResolver.register(InjectMe2, () => new InjectMe2());
  instanceResolver.register(Test, () => new Test());

  const resolvedInstance = instanceResolver.resolve(descriptor);
  expect(resolvedInstance).toBeInstanceOf(Test);
  expect(resolvedInstance.inject1).toBeInstanceOf(InjectMe1);
  expect(resolvedInstance.inject2).toBeInstanceOf(InjectMe2);
  expect(resolvedInstance.inject1.nestedInject).toBeUndefined();
});

test('can resolve parent class from registered child class', () => {
  class Parent {}
  class Child extends Parent {}
  const descriptor = getMapperDescriptor(Parent, {});
  const preCreateInstance = new Child();
  instanceResolver.register(Child, preCreateInstance);
  const resolvedInstance = instanceResolver.resolve(descriptor);
  expect(resolvedInstance).toBe(preCreateInstance);
});
