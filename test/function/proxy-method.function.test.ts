import { DEFAULT_PROXY_METHOD_FN } from '../../src/function/proxy-method.function';
import { MappingContext } from '../../src/mapping-context';

class Source {
  prop1: number;
  prop2: string;
}

class SubSource {
  prop4: string;
}
class NestedSource {
  prop1: number;
  prop2: string;
  prop3: SubSource;
}

const mapFnMock = jest.fn().mockImplementation((source) => source);
const targetFactoryFnMock = jest.fn().mockImplementation((targetType) => (targetType ? new targetType() : {}));
const propertyExtractFnMock = jest.fn().mockImplementation((prop, rawPath, splits) => {
  if (!prop) {
    return undefined;
  }

  let ret = prop;
  for (const split of splits) {
    ret = ret[split];
  }
  return ret;
});
const propertyMapFnMock = jest.fn().mockImplementation((sourceValue) => sourceValue);

const getBaseContext: (
  custom: Partial<{
    source;
    sourceType;
    targetType;
    mappings;
    getObjectMapperMock;
    afterMappingMethods;
    beforeMappingMethods;
    mapMethodMetadata;
    targetFactoryFn;
  }>,
) => MappingContext = ({
  source,
  sourceType,
  targetType,
  mappings,
  getObjectMapperMock,
  afterMappingMethods,
  beforeMappingMethods,
  mapMethodMetadata,
  targetFactoryFn,
}) => ({
  arguments: [],
  source: source,
  target: null,
  sourceType: sourceType,
  targetType: targetType,
  options: {
    propertyExtractFn: propertyExtractFnMock,
  },
  getObjectMapper: getObjectMapperMock,
  methodDescriptor: {
    name: 'map',
    afterMappingMethods: afterMappingMethods ?? {},
    beforeMappingMethods: beforeMappingMethods ?? {},
    metadata: {
      sourceType: sourceType,
      targetType: targetType,
      ...mapMethodMetadata,
    },
    mappings: mappings ?? {},
    mapFn: mapFnMock,
    targetFactoryFn: targetFactoryFn ?? targetFactoryFnMock,
  },
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('with anonymous type', () => {
  const getObjectMapperMock = jest.fn().mockImplementation(() => ({}));
  const getContext = (
    custom: Partial<{ targetType; mappings; source; sourceType; mapMethodMetadata; targetFactoryFn }>,
  ) => getBaseContext({ ...custom, getObjectMapperMock });

  beforeEach(() => {
    getObjectMapperMock.mockClear();
  });

  test('with specify properties then returns these mapping properties', () => {
    const source = {
      prop1: 'son',
      prop2: {
        name1: 'tran',
        name2: 'xuan',
      },
    };
    const context = getContext({
      source,
      mappings: {
        prop1: {
          target: 'prop1',
          source: 'prop1',
          splitSources: ['prop1'],
          transform: propertyMapFnMock,
        },
        prop2: {
          target: 'prop2',
          source: 'prop2.name1',
          splitSources: ['prop2', 'name1'],
          transform: propertyMapFnMock,
        },
      },
      mapMethodMetadata: {
        properties: [
          { target: 'prop1', source: 'prop1' },
          { target: 'prop2', source: 'prop2.name1' },
        ],
      },
    });

    const target = DEFAULT_PROXY_METHOD_FN(source, context);

    expect(target).toBeDefined();
    expect(target.prop1).toEqual(source.prop1);
    expect(target.prop2).toEqual(source.prop2.name1);
    expect(mapFnMock).not.toBeCalled();
    expect(targetFactoryFnMock).toBeCalledTimes(1);
    expect(getObjectMapperMock).not.toBeCalled();
    expect(propertyExtractFnMock).toBeCalledTimes(2);
    expect(propertyMapFnMock).toBeCalledTimes(2);
  });

  test('with specify excludes then mapping all properties except for these one', () => {
    const source = {
      prop1: 'son',
      prop2: {
        name1: 'tran',
        name2: 'xuan',
      },
    };
    const context = getContext({
      source,
      mapMethodMetadata: {
        excludes: {
          prop2: true,
        },
      },
    });

    const target = DEFAULT_PROXY_METHOD_FN(source, context);

    expect(target).toBeDefined();
    expect(target.prop1).toEqual(source.prop1);
    expect(target.prop2).toBeUndefined();
    expect(mapFnMock).not.toBeCalled();
    expect(targetFactoryFnMock).toBeCalledTimes(1);
    expect(getObjectMapperMock).not.toBeCalled();
    expect(propertyExtractFnMock).toBeCalledTimes(0);
    expect(propertyMapFnMock).toBeCalledTimes(0);
  });

  test('with specify includes then mapping all properties and additional specific properties', () => {
    const source = {
      prop1: 'son',
      prop2: {
        name1: 'tran',
        name2: 'xuan',
      },
    };
    const context = getContext({
      source,
      mappings: {
        prop3: {
          target: 'prop3',
          source: 'prop2.name2',
          splitSources: ['prop2', 'name2'],
          transform: propertyMapFnMock,
        },
      },
      mapMethodMetadata: {
        includes: [{ target: 'prop3', source: 'prop2.name2' }],
      },
    });

    const target = DEFAULT_PROXY_METHOD_FN(source, context);

    expect(target).toBeDefined();
    expect(target.prop1).toEqual(source.prop1);
    expect(target.prop2).toEqual(source.prop2);
    expect(target.prop3).toEqual(source.prop2.name2);
    expect(mapFnMock).not.toBeCalled();
    expect(targetFactoryFnMock).toBeCalledTimes(1);
    expect(getObjectMapperMock).not.toBeCalled();
    expect(propertyExtractFnMock).toBeCalledTimes(1);
    expect(propertyMapFnMock).toBeCalledTimes(1);
  });

  test('can custom target factory', () => {
    const source = {
      prop1: 'son',
      prop2: {
        name1: 'tran',
        name2: 'xuan',
      },
    };

    const targetFactoryFnMock = jest.fn().mockImplementation(() => ({ prop10: 123 }));
    const context = getContext({
      source,
      mappings: {
        prop1: {
          target: 'prop1',
          source: 'prop1',
          splitSources: ['prop1'],
          transform: propertyMapFnMock,
        },
        prop2: {
          target: 'prop2',
          source: 'prop2.name1',
          splitSources: ['prop2', 'name1'],
          transform: propertyMapFnMock,
        },
      },
      mapMethodMetadata: {
        properties: [
          { target: 'prop1', source: 'prop1' },
          { target: 'prop2', source: 'prop2.name1' },
        ],
      },
      targetFactoryFn: targetFactoryFnMock,
    });

    const target = DEFAULT_PROXY_METHOD_FN(source, context);

    expect(target).toBeDefined();
    expect(target.prop1).toEqual(source.prop1);
    expect(target.prop2).toEqual(source.prop2.name1);
    expect(target.prop10).toEqual(123);
    expect(mapFnMock).not.toBeCalled();
    expect(targetFactoryFnMock).toBeCalledTimes(1);
    expect(getObjectMapperMock).not.toBeCalled();
    expect(propertyExtractFnMock).toBeCalledTimes(2);
    expect(propertyMapFnMock).toBeCalledTimes(2);
  });
});

describe('without hook', () => {
  const getObjectMapperMock = jest.fn().mockImplementation(() => ({}));
  const getContext = (custom: Partial<{ targetType; mappings; source; sourceType }>) =>
    getBaseContext({ ...custom, getObjectMapperMock });

  beforeEach(() => {
    getObjectMapperMock.mockClear();
  });

  test('with all matched properties source then returns all matched properties target', () => {
    class Target {
      prop1: number;
      prop2: string;
    }

    const source = new Source();
    source.prop1 = 123;
    source.prop2 = 'son';

    const context = getContext({
      source,
      sourceType: Source,
      targetType: Target,
      mappings: {
        prop1: {
          target: 'prop1',
          source: 'prop1',
          splitSources: ['prop1'],
          targetPropertyMetadata: {},
          transform: propertyMapFnMock,
          metadata: {
            source: 'prop1',
            target: 'prop1',
          },
        },
        prop2: {
          target: 'prop2',
          source: 'prop2',
          splitSources: ['prop2'],
          targetPropertyMetadata: {},
          transform: propertyMapFnMock,
          metadata: {
            source: 'prop2',
            target: 'prop2',
          },
        },
      },
    });
    const target = DEFAULT_PROXY_METHOD_FN(source, context);

    expect(target).toBeInstanceOf(Target);
    expect(target).toEqual(source);
    expect(mapFnMock).not.toBeCalled();
    expect(targetFactoryFnMock).toBeCalledTimes(1);
    expect(getObjectMapperMock).not.toBeCalled();
    expect(propertyExtractFnMock).toBeCalledTimes(2);
    expect(propertyMapFnMock).toBeCalledTimes(2);
  });

  test('with missing source properties then return target without these missing mapping properties', () => {
    class Target {
      prop1: number;
    }

    const source = new Source();
    source.prop1 = 123;

    const context = getContext({
      source,
      sourceType: Source,
      targetType: Target,
      mappings: {
        prop1: {
          target: 'prop1',
          source: 'prop1',
          splitSources: ['prop1'],
          targetPropertyMetadata: {},
          transform: propertyMapFnMock,
          metadata: {
            source: 'prop1',
            target: 'prop1',
          },
        },
        prop2: {
          target: 'prop2',
          source: 'prop2',
          splitSources: ['prop2'],
          targetPropertyMetadata: {},
          transform: propertyMapFnMock,
          metadata: {
            source: 'prop2',
            target: 'prop2',
          },
        },
      },
    });
    const target = DEFAULT_PROXY_METHOD_FN(source, context);

    expect(target).toBeInstanceOf(Target);
    expect(target.prop1).toEqual(source.prop1);
    expect(target.prop2).toBeUndefined();
    expect(mapFnMock).not.toBeCalled();
    expect(targetFactoryFnMock).toBeCalledTimes(1);
    expect(getObjectMapperMock).not.toBeCalled();
    expect(propertyExtractFnMock).toBeCalledTimes(2);
    expect(propertyMapFnMock).toBeCalledTimes(2);
  });

  test('with empty target definition then return an empty target instance', () => {
    class Target {}

    const source = new Source();
    source.prop1 = 123;
    source.prop2 = 'son';

    const context = getContext({
      source,
      sourceType: Source,
      targetType: Target,
      mappings: {},
    });
    const target = DEFAULT_PROXY_METHOD_FN(source, context);

    expect(target).toBeInstanceOf(Target);
    expect(target).toEqual({});
    expect(mapFnMock).not.toBeCalled();
    expect(targetFactoryFnMock).toBeCalledTimes(1);
    expect(getObjectMapperMock).not.toBeCalled();
    expect(propertyExtractFnMock).toBeCalledTimes(0);
    expect(propertyMapFnMock).toBeCalledTimes(0);
  });

  test('with an null source then return an empty target', () => {
    class Target {
      prop1: number;
      prop2: string;
    }

    const context = getContext({
      source: null,
      sourceType: Source,
      targetType: Target,
      mappings: {
        prop1: {
          target: 'prop1',
          source: 'prop1',
          splitSources: ['prop1'],
          targetPropertyMetadata: {},
          transform: propertyMapFnMock,
          metadata: {
            source: 'prop1',
            target: 'prop1',
          },
        },
        prop2: {
          target: 'prop2',
          source: 'prop2',
          splitSources: ['prop2'],
          targetPropertyMetadata: {},
          transform: propertyMapFnMock,
          metadata: {
            source: 'prop2',
            target: 'prop2',
          },
        },
      },
    });
    const target = DEFAULT_PROXY_METHOD_FN(null, context);

    expect(target).toBeInstanceOf(Target);
    expect(target).toEqual({});
    expect(mapFnMock).not.toBeCalled();
    expect(targetFactoryFnMock).toBeCalledTimes(1);
    expect(getObjectMapperMock).not.toBeCalled();
    expect(propertyExtractFnMock).toBeCalledTimes(0);
    expect(propertyMapFnMock).toBeCalledTimes(0);
  });

  test('can map nested source to nested target', () => {
    class Target {
      prop1: number;
      prop2: string;
      prop3: {
        prop4: string;
      };
    }
    const source = new NestedSource();
    source.prop1 = 123;
    source.prop2 = 'son';
    const subSource = new SubSource();
    subSource.prop4 = 'my name is son';
    source.prop3 = subSource;

    const context = getContext({
      source: source,
      sourceType: NestedSource,
      targetType: Target,
      mappings: {
        prop1: {
          target: 'prop1',
          source: 'prop1',
          splitSources: ['prop1'],
          targetPropertyMetadata: {},
          transform: propertyMapFnMock,
          metadata: {
            source: 'prop1',
            target: 'prop1',
          },
        },
        prop2: {
          target: 'prop2',
          source: 'prop2',
          splitSources: ['prop2'],
          targetPropertyMetadata: {},
          transform: propertyMapFnMock,
          metadata: {
            source: 'prop2',
            target: 'prop2',
          },
        },
        prop3: {
          target: 'prop3',
          source: 'prop3',
          splitSources: ['prop3'],
          targetPropertyMetadata: {},
          transform: propertyMapFnMock,
          metadata: {
            source: 'prop3',
            target: 'prop3',
          },
        },
      },
    });
    const target = DEFAULT_PROXY_METHOD_FN(source, context);

    expect(target).toBeInstanceOf(Target);
    expect(target).toEqual(source);
    expect(mapFnMock).not.toBeCalled();
    expect(targetFactoryFnMock).toBeCalledTimes(1);
    expect(getObjectMapperMock).not.toBeCalled();
    expect(propertyExtractFnMock).toBeCalledTimes(3);
    expect(propertyMapFnMock).toBeCalledTimes(3);
  });
});

describe('with hook', () => {
  class Target {
    prop1: number;
    prop2: string;
  }

  let source: Source;
  const getContext: (
    custom: Partial<{ source; sourceType; targetType; getObjectMapperMock; afterMappingMethods; beforeMappingMethods }>,
  ) => MappingContext = (custom) =>
    getBaseContext({
      ...custom,
      mappings: {
        prop1: {
          target: 'prop1',
          source: 'prop1',
          splitSources: ['prop1'],
          targetPropertyMetadata: {},
          transform: propertyMapFnMock,
          metadata: {
            source: 'prop1',
            target: 'prop1',
          },
        },
        prop2: {
          target: 'prop2',
          source: 'prop2',
          splitSources: ['prop2'],
          targetPropertyMetadata: {},
          transform: propertyMapFnMock,
          metadata: {
            source: 'prop2',
            target: 'prop2',
          },
        },
      },
    });

  beforeEach(() => {
    source = new Source();
    source.prop1 = 123;
    source.prop2 = 'son';
  });

  describe('before hook', () => {
    test('before hook should be called right after creating target and before mapping properties', () => {
      const beforeHookMock = jest.fn().mockImplementation(() => {});
      const getObjectMapperMock = jest.fn().mockImplementation(() => {
        return {
          before: beforeHookMock,
        };
      });

      const context = getContext({
        source,
        targetType: Target,
        sourceType: Source,
        getObjectMapperMock,
        beforeMappingMethods: {
          before: {
            name: 'before',
            metadata: {
              methodName: 'before',
              sourceType: Source,
              targetType: Target,
            },
          },
        },
      });
      const target = DEFAULT_PROXY_METHOD_FN(source, context);

      expect(target).toBeInstanceOf(Target);
      expect(target).toEqual(source);
      expect(mapFnMock).not.toBeCalled();
      expect(targetFactoryFnMock).toBeCalledTimes(1);
      expect(getObjectMapperMock).toBeCalledTimes(1);
      expect(propertyExtractFnMock).toBeCalledTimes(2);
      expect(propertyMapFnMock).toBeCalledTimes(2);

      expect(beforeHookMock).toBeCalledTimes(1);
      expect(beforeHookMock).toBeCalledWith({
        ...context,
        target,
      });

      expect(targetFactoryFnMock.mock.invocationCallOrder[0]).toBeLessThan(beforeHookMock.mock.invocationCallOrder[0]);
      expect(propertyExtractFnMock.mock.invocationCallOrder[0]).toBeGreaterThan(
        beforeHookMock.mock.invocationCallOrder[0],
      );
      expect(propertyMapFnMock.mock.invocationCallOrder[0]).toBeGreaterThan(beforeHookMock.mock.invocationCallOrder[0]);
    });

    test('should call all provided before hooks', () => {
      const beforeHookMock1 = jest.fn().mockImplementation(() => {});
      const beforeHookMock2 = jest.fn().mockImplementation(() => {});
      const getObjectMapperMock = jest.fn().mockImplementation(() => {
        return {
          before1: beforeHookMock1,
          before2: beforeHookMock2,
        };
      });

      const context = getContext({
        source,
        targetType: Target,
        sourceType: Source,
        getObjectMapperMock,
        beforeMappingMethods: {
          before1: {
            name: 'before1',
            metadata: {
              methodName: 'before1',
              sourceType: Source,
              targetType: Target,
            },
          },
          before2: {
            name: 'before2',
            metadata: {
              methodName: 'before2',
              sourceType: Source,
              targetType: Target,
            },
          },
        },
      });

      const target = DEFAULT_PROXY_METHOD_FN(source, context);

      expect(target).toBeInstanceOf(Target);
      expect(target).toEqual(source);
      expect(mapFnMock).not.toBeCalled();
      expect(targetFactoryFnMock).toBeCalledTimes(1);
      expect(getObjectMapperMock).toBeCalledTimes(1);
      expect(propertyExtractFnMock).toBeCalledTimes(2);
      expect(propertyMapFnMock).toBeCalledTimes(2);

      expect(beforeHookMock1).toBeCalledTimes(1);
      expect(beforeHookMock1).toBeCalledWith({
        ...context,
        target,
      });

      expect(beforeHookMock2).toBeCalledTimes(1);
      expect(beforeHookMock2).toBeCalledWith({
        ...context,
        target,
      });
    });
  });

  describe('after hook', () => {
    test('after hook should be called right after mapping properties', () => {
      const afterHookMock = jest.fn().mockImplementation(() => {});
      const getObjectMapperMock = jest.fn().mockImplementation(() => {
        return {
          after: afterHookMock,
        };
      });

      const context = getContext({
        source,
        sourceType: Source,
        targetType: Target,
        getObjectMapperMock,
        afterMappingMethods: {
          after: {
            name: 'after',
            metadata: {
              methodName: 'after',
              sourceType: Source,
              targetType: Target,
            },
          },
        },
      });
      const target = DEFAULT_PROXY_METHOD_FN(source, context);

      expect(target).toBeInstanceOf(Target);
      expect(target).toEqual(source);
      expect(mapFnMock).not.toBeCalled();
      expect(targetFactoryFnMock).toBeCalledTimes(1);
      expect(getObjectMapperMock).toBeCalledTimes(1);
      expect(propertyExtractFnMock).toBeCalledTimes(2);
      expect(propertyMapFnMock).toBeCalledTimes(2);

      expect(afterHookMock).toBeCalledTimes(1);
      expect(afterHookMock).toBeCalledWith({
        ...context,
        target,
      });

      expect(propertyExtractFnMock.mock.invocationCallOrder[0]).toBeLessThan(afterHookMock.mock.invocationCallOrder[0]);
      expect(propertyMapFnMock.mock.invocationCallOrder[0]).toBeLessThan(afterHookMock.mock.invocationCallOrder[0]);
    });

    test('should call all provided after hooks', () => {
      const afterHookMock1 = jest.fn().mockImplementation(() => {});
      const afterHookMock2 = jest.fn().mockImplementation(() => {});
      const getObjectMapperMock = jest.fn().mockImplementation(() => {
        return {
          after1: afterHookMock1,
          after2: afterHookMock2,
        };
      });

      const context = getContext({
        source,
        sourceType: Source,
        targetType: Target,
        getObjectMapperMock,
        afterMappingMethods: {
          after1: {
            name: 'after1',
            metadata: {
              methodName: 'after1',
              sourceType: Source,
              targetType: Target,
            },
          },
          after2: {
            name: 'after2',
            metadata: {
              methodName: 'after2',
              sourceType: Source,
              targetType: Target,
            },
          },
        },
      });

      const target = DEFAULT_PROXY_METHOD_FN(source, context);

      expect(target).toBeInstanceOf(Target);
      expect(target).toEqual(source);
      expect(mapFnMock).not.toBeCalled();
      expect(targetFactoryFnMock).toBeCalledTimes(1);
      expect(getObjectMapperMock).toBeCalledTimes(1);
      expect(propertyExtractFnMock).toBeCalledTimes(2);
      expect(propertyMapFnMock).toBeCalledTimes(2);

      expect(afterHookMock1).toBeCalledTimes(1);
      expect(afterHookMock1).toBeCalledWith({
        ...context,
        target,
      });

      expect(afterHookMock2).toBeCalledTimes(1);
      expect(afterHookMock2).toBeCalledWith({
        ...context,
        target,
      });
    });

    test('after hook can override target with an non-null returned value', () => {
      const overrideValue = {
        username: 'sontx',
        password: 'youdontknowme',
      };
      let callContext;
      const afterHookMock = jest.fn().mockImplementation((context) => {
        callContext = context;
        return overrideValue;
      });
      const getObjectMapperMock = jest.fn().mockImplementation(() => {
        return {
          after: afterHookMock,
        };
      });

      const context = getContext({
        source,
        sourceType: Source,
        targetType: Target,
        getObjectMapperMock,
        afterMappingMethods: {
          after: {
            name: 'after',
            metadata: {
              methodName: 'after',
              sourceType: Source,
              targetType: Target,
            },
          },
        },
      });
      const target = DEFAULT_PROXY_METHOD_FN(source, context);

      expect(target).not.toBeInstanceOf(Target);
      expect(target).toEqual(overrideValue);
      expect(mapFnMock).not.toBeCalled();
      expect(targetFactoryFnMock).toBeCalledTimes(1);
      expect(getObjectMapperMock).toBeCalledTimes(1);
      expect(propertyExtractFnMock).toBeCalledTimes(2);
      expect(propertyMapFnMock).toBeCalledTimes(2);

      expect(afterHookMock).toBeCalledTimes(1);
      expect(afterHookMock).toBeCalledWith(callContext);

      expect(propertyExtractFnMock.mock.invocationCallOrder[0]).toBeLessThan(afterHookMock.mock.invocationCallOrder[0]);
      expect(propertyMapFnMock.mock.invocationCallOrder[0]).toBeLessThan(afterHookMock.mock.invocationCallOrder[0]);

      expect(afterHookMock).toReturnWith(overrideValue);
    });

    test('only the first non-null returned value of after hook is used to override target', () => {
      const overrideValue1 = {
        username: 'sontx',
        password: 'youdontknowme',
      };
      let callContext1;
      const afterHookMock1 = jest.fn().mockImplementation((context) => {
        callContext1 = context;
        return overrideValue1;
      });

      const overrideValue2 = {
        hello: 'will be ignored',
      };
      const afterHookMock2 = jest.fn().mockImplementation(() => overrideValue2);

      const getObjectMapperMock = jest.fn().mockImplementation(() => {
        return {
          after1: afterHookMock1,
          after2: afterHookMock2,
        };
      });

      const context = getContext({
        source,
        sourceType: Source,
        targetType: Target,
        getObjectMapperMock,
        afterMappingMethods: {
          after1: {
            name: 'after1',
            metadata: {
              methodName: 'after1',
              sourceType: Source,
              targetType: Target,
            },
          },
          after2: {
            name: 'after2',
            metadata: {
              methodName: 'after2',
              sourceType: Source,
              targetType: Target,
            },
          },
        },
      });
      const target = DEFAULT_PROXY_METHOD_FN(source, context);

      expect(target).not.toBeInstanceOf(Target);
      expect(target).toEqual(overrideValue1);
      expect(mapFnMock).not.toBeCalled();
      expect(targetFactoryFnMock).toBeCalledTimes(1);
      expect(getObjectMapperMock).toBeCalledTimes(1);
      expect(propertyExtractFnMock).toBeCalledTimes(2);
      expect(propertyMapFnMock).toBeCalledTimes(2);

      expect(afterHookMock1).toBeCalledTimes(1);
      expect(afterHookMock1).toBeCalledWith(callContext1);

      expect(afterHookMock2).toBeCalledTimes(1);
      expect(afterHookMock2).toBeCalledWith(callContext1);

      expect(propertyExtractFnMock.mock.invocationCallOrder[0]).toBeLessThan(
        afterHookMock1.mock.invocationCallOrder[0],
      );
      expect(propertyMapFnMock.mock.invocationCallOrder[0]).toBeLessThan(afterHookMock1.mock.invocationCallOrder[0]);

      expect(afterHookMock1).toReturnWith(overrideValue1);
    });
  });
});
