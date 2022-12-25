import { MapperDescriptor } from '../../src/descriptor/mapper.descriptor';
import { DefaultMapperUsesLinker, MapperUsesLinker } from '../../src/service/mapper-uses-linker';

class MyObjectMapper {}

class SourceProp1 {
  username: string;
  password: string;
}
class Source {
  prop1: SourceProp1;
  prop2: number;
}

class TargetProp1 {
  display: string;
}

class Target {
  prop1: TargetProp1;
  prop2: number;
}

const mapFnMock1 = jest.fn((source) => {
  const target = new Target();
  target.prop1 = source.prop1;
  target.prop2 = source.prop2;
  return target;
});
const mapFnMock2 = jest.fn((source) => {
  const target = new TargetProp1();
  target.display = source.username;
  return target;
});
const originalTransformMock1 = jest.fn();
const originalTransformMock2 = jest.fn();

let mapperUsesLinker: MapperUsesLinker;
const createDescriptor = (): MapperDescriptor => ({
  injects: {},
  metadata: {},
  uses: [],
  mapMethods: {
    map: {
      name: 'map',
      mappings: {},
      afterMappingMethods: {},
      beforeMappingMethods: {},
      mapFn: null,
      metadata: {
        targetType: null,
        sourceType: null,
      },
      targetFactoryFn: targetFactoryFnMock,
    },
  },
  type: MyObjectMapper,
  instanceResolve: null,
});

const targetFactoryFnMock = jest.fn((targetType) => new targetType());

beforeEach(() => {
  targetFactoryFnMock.mockClear();
  mapFnMock1.mockClear();
  mapFnMock2.mockClear();
  originalTransformMock1.mockClear();
  originalTransformMock2.mockClear();

  mapperUsesLinker = new DefaultMapperUsesLinker();
});

test('property mapping should use linked map method if source prop can not assign to target prop', () => {
  const linkedDescriptor = createDescriptor();
  linkedDescriptor.mapMethods['map'].mappings['display'] = {
    source: 'username',
    splitSources: ['username'],
    target: 'display',
    transform: originalTransformMock2,
    targetPropertyMetadata: {},
  };
  linkedDescriptor.mapMethods['map'].mapFn = mapFnMock2;
  linkedDescriptor.mapMethods['map'].metadata = {
    sourceType: SourceProp1,
    targetType: TargetProp1,
  };

  const descriptor = createDescriptor();
  descriptor.mapMethods['map'].mappings['prop1'] = {
    source: 'prop1',
    splitSources: ['prop1'],
    target: 'prop1',
    transform: originalTransformMock1,
    sourcePropertyMetadata: {
      type: SourceProp1,
    },
    targetPropertyMetadata: {
      type: TargetProp1,
    },
  };
  descriptor.mapMethods['map'].mapFn = mapFnMock1;
  descriptor.mapMethods['map'].metadata = {
    sourceType: Source,
    targetType: Target,
  };
  descriptor.uses = [linkedDescriptor];

  mapperUsesLinker.link(descriptor);

  expect(descriptor.mapMethods.map.mappings['prop1'].transform).not.toEqual(originalTransformMock1);

  const sourceProp1 = new SourceProp1();
  sourceProp1.password = 'youdontknownme';
  sourceProp1.username = 'son';

  const targetProp1 = descriptor.mapMethods.map.mappings['prop1'].transform(sourceProp1, {} as any);
  expect(targetProp1).toBeDefined();
  expect(targetProp1.display).toEqual('son');
  expect(mapFnMock1).not.toBeCalled();
  expect(mapFnMock2).toBeCalledTimes(1);
  expect(originalTransformMock1).not.toBeCalled();
  expect(originalTransformMock2).not.toBeCalled();
});

test('property mapping should ignore linked map method if mapping is defined', () => {
  const linkedDescriptor = createDescriptor();
  linkedDescriptor.mapMethods['map'].mappings['display'] = {
    source: 'username',
    splitSources: ['username'],
    target: 'display',
    transform: originalTransformMock2,
    targetPropertyMetadata: {},
  };
  linkedDescriptor.mapMethods['map'].mapFn = mapFnMock2;
  linkedDescriptor.mapMethods['map'].metadata = {
    sourceType: SourceProp1,
    targetType: TargetProp1,
  };

  const descriptor = createDescriptor();
  descriptor.mapMethods['map'].mappings['prop1'] = {
    source: 'prop1',
    splitSources: ['prop1'],
    target: 'prop1',
    transform: originalTransformMock1,
    metadata: { source: 'prop1', target: 'prop1', transform: originalTransformMock1 },
    sourcePropertyMetadata: {
      type: SourceProp1,
    },
    targetPropertyMetadata: {
      type: TargetProp1,
    },
  };
  descriptor.mapMethods['map'].mapFn = mapFnMock1;
  descriptor.mapMethods['map'].metadata = {
    sourceType: Source,
    targetType: Target,
  };
  descriptor.uses = [linkedDescriptor];

  mapperUsesLinker.link(descriptor);

  expect(descriptor.mapMethods.map.mappings['prop1'].transform).toEqual(originalTransformMock1);
});

test('property mapping should ignore linked map method if exact is set in map method', () => {
  const linkedDescriptor = createDescriptor();
  linkedDescriptor.mapMethods['map'].mappings['display'] = {
    source: 'username',
    splitSources: ['username'],
    target: 'display',
    transform: originalTransformMock2,
    targetPropertyMetadata: {},
  };
  linkedDescriptor.mapMethods['map'].mapFn = mapFnMock2;
  linkedDescriptor.mapMethods['map'].metadata = {
    sourceType: SourceProp1,
    targetType: TargetProp1,
  };

  const descriptor = createDescriptor();
  descriptor.mapMethods['map'].mappings['prop1'] = {
    source: 'prop1',
    splitSources: ['prop1'],
    target: 'prop1',
    transform: originalTransformMock1,
    sourcePropertyMetadata: {
      type: SourceProp1,
    },
    targetPropertyMetadata: {
      type: TargetProp1,
    },
  };
  descriptor.mapMethods['map'].mapFn = mapFnMock1;
  descriptor.mapMethods['map'].metadata = {
    sourceType: Source,
    targetType: Target,
    exact: true,
  };
  descriptor.uses = [linkedDescriptor];

  mapperUsesLinker.link(descriptor);

  expect(descriptor.mapMethods.map.mappings['prop1'].transform).toEqual(originalTransformMock1);
});

test('property mapping should ignore linked map method if source and target types are not exact the same', () => {
  class SubSourceProp1 extends SourceProp1 {}

  const linkedDescriptor = createDescriptor();
  linkedDescriptor.mapMethods['map'].mappings['display'] = {
    source: 'username',
    splitSources: ['username'],
    target: 'display',
    transform: originalTransformMock2,
    targetPropertyMetadata: {},
  };
  linkedDescriptor.mapMethods['map'].mapFn = mapFnMock2;
  linkedDescriptor.mapMethods['map'].metadata = {
    sourceType: SubSourceProp1,
    targetType: TargetProp1,
  };

  const descriptor = createDescriptor();
  descriptor.mapMethods['map'].mappings['prop1'] = {
    source: 'prop1',
    splitSources: ['prop1'],
    target: 'prop1',
    transform: originalTransformMock1,
    sourcePropertyMetadata: {
      type: SourceProp1,
    },
    targetPropertyMetadata: {
      type: TargetProp1,
    },
  };
  descriptor.mapMethods['map'].mapFn = mapFnMock1;
  descriptor.mapMethods['map'].metadata = {
    sourceType: Source,
    targetType: Target,
  };
  descriptor.uses = [linkedDescriptor];

  mapperUsesLinker.link(descriptor);

  expect(descriptor.mapMethods.map.mappings['prop1'].transform).toEqual(originalTransformMock1);
});
