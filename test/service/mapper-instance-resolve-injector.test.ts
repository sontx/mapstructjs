import { DefaultMapMethodInjector, MapMethodInjector } from '../../src/service/map-method-injector';
import { MapperDescriptor } from '../../src/descriptor/mapper.descriptor';

class Source {
  prop1: string;
  prop2: number;
}

class Target {
  prop1: string;
  prop2: number;
}

class MyObjectMapper {
  map: (source: Source) => Target;
}

let mapperMapMethodInjector: MapMethodInjector;
let descriptor: MapperDescriptor;

const instanceResolveMock = jest.fn();
const mapFnMock = jest.fn((source) => {
  const target = new Target();
  target.prop1 = source.prop1;
  target.prop2 = source.prop2;
  return target;
});
const targetFactoryFnMock = jest.fn((targetType) => new targetType());

beforeEach(() => {
  instanceResolveMock.mockClear();
  mapFnMock.mockClear();
  targetFactoryFnMock.mockClear();

  mapperMapMethodInjector = new DefaultMapMethodInjector();
  descriptor = {
    injects: {},
    metadata: {},
    uses: [],
    mapMethods: {
      map: {
        name: 'map',
        mappings: {},
        afterMappingMethods: {},
        beforeMappingMethods: {},
        mapFn: mapFnMock,
        metadata: {
          targetType: null,
          sourceType: null,
        },
        targetFactoryFn: targetFactoryFnMock,
      },
    },
    type: MyObjectMapper,
    instanceResolve: instanceResolveMock,
  };
});

test('map method should be decorated by a proxy method', () => {
  const objectMapper = new MyObjectMapper();
  mapperMapMethodInjector.inject(objectMapper, descriptor);
  expect(objectMapper.map).not.toEqual(MyObjectMapper.prototype.map);
});

test('map method should invoke mapFn of its method decorator', () => {
  const objectMapper = new MyObjectMapper();
  mapperMapMethodInjector.inject(objectMapper, descriptor);
  const source = new Source();
  source.prop1 = 'son';
  source.prop2 = 123;
  const target = objectMapper.map(source);
  expect(target).toBeInstanceOf(Target);
  expect(target).toEqual(source);
  expect(mapFnMock).toBeCalledTimes(1);
});

test('can not inject mismatch object mapper type and its decorator type', () => {
  class AnotherObjectMapper {}
  descriptor.type = AnotherObjectMapper;

  const objectMapper = new MyObjectMapper();
  expect(() => mapperMapMethodInjector.inject(objectMapper, descriptor)).toThrow(TypeError);
});
