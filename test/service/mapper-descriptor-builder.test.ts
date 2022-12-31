import { DefaultMapperDescriptorBuilder, MapperDescriptorBuilder } from '../../src/service/mapper-descriptor-builder';

import 'reflect-metadata';
import { MapMethod } from '../../src/decorator/map-method.decorator';
import { Mapping } from '../../src/decorator/mapping.decorator';
import { Property } from '../../src/decorator/property.decorator';
import { Mapper } from '../../src/decorator/mapper.decorator';
import { AfterMapping } from '../../src/decorator/after-mapping.decorator';
import { BeforeMapping } from '../../src/decorator/before-mapping.decorator';
import { Inject } from '../../src/decorator/inject.decorator';

let mapperDescriptorBuilder: MapperDescriptorBuilder;

beforeEach(() => {
  mapperDescriptorBuilder = new DefaultMapperDescriptorBuilder();
});

describe('MapperDescriptor', () => {
  test('can build descriptor without any annotations', () => {
    class MyMapper {
      callMe() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);
    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toEqual({});
    expect(descriptor.injects).toEqual({});
    expect(descriptor.uses).toEqual([]);
    expect(descriptor.metadata).toBeUndefined();
    expect(descriptor.type).toEqual(MyMapper);
    expect(descriptor.instanceResolve).toBeInstanceOf(Function);
  });

  test('can build descriptor with all annotations', () => {
    class InjectMe {}
    class Source {
      @Property()
      prop1: string;
    }
    class Target {
      @Property()
      prop1: string;
    }

    @Mapper()
    class MyMapper {
      @Inject(InjectMe)
      inject: InjectMe;

      @Mapping({ target: 'prop1' })
      @MapMethod({ targetType: Target, sourceType: Source })
      callMe() {}

      @BeforeMapping()
      before() {}

      @AfterMapping()
      after() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);
    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods['callMe']).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1']).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].targetPropertyMetadata).toBeDefined();
    expect(descriptor.injects['inject']).toBeDefined();
    expect(descriptor.uses[0].type).toEqual(InjectMe);
    expect(descriptor.metadata).toBeDefined();
    expect(descriptor.type).toEqual(MyMapper);
    expect(descriptor.instanceResolve).toBeInstanceOf(Function);
  });

  test('can build list of uses from @Mapper', () => {
    class MyService {}

    class AnotherService {}

    @Mapper({ uses: [AnotherService] })
    class AnotherMapper {}

    @Mapper({ uses: [AnotherMapper, MyService] })
    class MyMapper {}

    const descriptor = mapperDescriptorBuilder.build(MyMapper);
    expect(descriptor).toBeDefined();
    expect(descriptor.uses.map((use) => use.type).sort()).toEqual([MyService, AnotherMapper].sort());
    expect(descriptor.uses.find((use) => use.type === AnotherMapper).uses[0].type).toEqual(AnotherService);
  });

  test('can not use type as a dependency of itself', () => {
    @Mapper({ uses: [MyMapper] })
    class MyMapper {}
    expect(() => mapperDescriptorBuilder.build(MyMapper)).toThrow(TypeError);
  });
});

describe('MapMethodDescriptor', () => {
  test('can build descriptor with minimum config', () => {
    class Source {}
    class Target {}

    class MyMapper {
      @MapMethod({ targetType: Target, sourceType: Source })
      callMe() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);

    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toBeDefined();

    expect(descriptor.mapMethods['callMe']).toBeDefined();
    expect(descriptor.mapMethods['callMe'].name).toEqual('callMe');
    expect(descriptor.mapMethods['callMe'].mappings).toEqual({});
    expect(descriptor.mapMethods['callMe'].beforeMappingMethods).toEqual({});
    expect(descriptor.mapMethods['callMe'].afterMappingMethods).toEqual({});
    expect(descriptor.mapMethods['callMe'].targetFactoryFn).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mapFn).toBeDefined();
    expect(descriptor.mapMethods['callMe'].metadata).toBeDefined();

    expect(descriptor.injects).toEqual({});
    expect(descriptor.uses).toEqual([]);
    expect(descriptor.metadata).toBeUndefined();
    expect(descriptor.type).toEqual(MyMapper);
    expect(descriptor.instanceResolve).toBeInstanceOf(Function);
  });

  test('support multiple map methods', () => {
    class Source {}
    class Target {}

    class MyMapper {
      @MapMethod({ targetType: Target, sourceType: Source })
      callMe1() {}

      @MapMethod({ targetType: Target, sourceType: Source })
      callMe2() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);

    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toBeDefined();

    expect(descriptor.mapMethods['callMe1']).toBeDefined();
    expect(descriptor.mapMethods['callMe1'].name).toEqual('callMe1');
    expect(descriptor.mapMethods['callMe1'].beforeMappingMethods).toEqual({});
    expect(descriptor.mapMethods['callMe1'].afterMappingMethods).toEqual({});
    expect(descriptor.mapMethods['callMe1'].targetFactoryFn).toBeDefined();
    expect(descriptor.mapMethods['callMe1'].mapFn).toBeDefined();
    expect(descriptor.mapMethods['callMe1'].metadata).toBeDefined();

    expect(descriptor.mapMethods['callMe2']).toBeDefined();
    expect(descriptor.mapMethods['callMe2'].name).toEqual('callMe2');
    expect(descriptor.mapMethods['callMe2'].beforeMappingMethods).toEqual({});
    expect(descriptor.mapMethods['callMe2'].afterMappingMethods).toEqual({});
    expect(descriptor.mapMethods['callMe2'].targetFactoryFn).toBeDefined();
    expect(descriptor.mapMethods['callMe2'].mapFn).toBeDefined();
    expect(descriptor.mapMethods['callMe2'].metadata).toBeDefined();

    expect(descriptor.injects).toEqual({});
    expect(descriptor.uses).toEqual([]);
    expect(descriptor.metadata).toBeUndefined();
    expect(descriptor.type).toEqual(MyMapper);
    expect(descriptor.instanceResolve).toBeInstanceOf(Function);
  });

  describe('anonymous type', () => {
    test('can build descriptor with map specific includes', () => {
      class MyMapper {
        @MapMethod({ includes: [['prop1'], ['prop2']] })
        callMe() {}
      }

      const descriptor = mapperDescriptorBuilder.build(MyMapper);

      expect(descriptor).toBeDefined();
      expect(descriptor.mapMethods).toBeDefined();
      expect(descriptor.mapMethods['callMe']).toBeDefined();
      expect(descriptor.mapMethods['callMe'].mappings).toBeDefined();
      expect(descriptor.mapMethods['callMe'].mappings['prop1']).toBeDefined();
      expect(descriptor.mapMethods['callMe'].mappings['prop1'].target).toEqual('prop1');
      expect(descriptor.mapMethods['callMe'].mappings['prop1'].source).toEqual('prop1');
      expect(descriptor.mapMethods['callMe'].mappings['prop2']).toBeDefined();
      expect(descriptor.mapMethods['callMe'].mappings['prop2'].target).toEqual('prop2');
      expect(descriptor.mapMethods['callMe'].mappings['prop2'].source).toEqual('prop2');
    });

    test('can build descriptor with map specific properties', () => {
      class MyMapper {
        @MapMethod({ properties: [['prop1'], ['prop2']] })
        callMe() {}
      }

      const descriptor = mapperDescriptorBuilder.build(MyMapper);

      expect(descriptor).toBeDefined();
      expect(descriptor.mapMethods).toBeDefined();
      expect(descriptor.mapMethods['callMe']).toBeDefined();
      expect(descriptor.mapMethods['callMe'].mappings).toBeDefined();
      expect(descriptor.mapMethods['callMe'].mappings['prop1']).toBeDefined();
      expect(descriptor.mapMethods['callMe'].mappings['prop1'].target).toEqual('prop1');
      expect(descriptor.mapMethods['callMe'].mappings['prop1'].source).toEqual('prop1');
      expect(descriptor.mapMethods['callMe'].mappings['prop2']).toBeDefined();
      expect(descriptor.mapMethods['callMe'].mappings['prop2'].target).toEqual('prop2');
      expect(descriptor.mapMethods['callMe'].mappings['prop2'].source).toEqual('prop2');
    });
  });
});

describe('MappingDescriptor', () => {
  test('can build descriptor with minimum config', () => {
    class Source {}
    class Target {}

    class MyMapper {
      @Mapping({ target: 'prop1' })
      @MapMethod({ targetType: Target, sourceType: Source })
      callMe() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);

    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toBeDefined();

    expect(descriptor.mapMethods['callMe']).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1']).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].target).toEqual('prop1');
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].source).toEqual('prop1');
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].splitSources).toEqual(['prop1']);
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].transform).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].metadata).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].targetPropertyMetadata).toBeUndefined();

    expect(descriptor.injects).toEqual({});
    expect(descriptor.uses).toEqual([]);
    expect(descriptor.metadata).toBeUndefined();
    expect(descriptor.type).toEqual(MyMapper);
    expect(descriptor.instanceResolve).toBeInstanceOf(Function);
  });

  test('ignore unknown properties if ignoreUnknownProperties is set for @MapMethod', () => {
    class Source {}
    class Target {
      @Property()
      prop1: string;
    }

    class MyMapper {
      @Mapping({ target: 'prop1' })
      @Mapping({ target: 'prop2' })
      @MapMethod({ targetType: Target, sourceType: Source, ignoreUnknownProperties: true })
      callMe() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);

    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toBeDefined();

    expect(descriptor.mapMethods['callMe']).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop2']).toBeUndefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1']).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].target).toEqual('prop1');
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].source).toEqual('prop1');
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].splitSources).toEqual(['prop1']);
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].transform).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].metadata).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].targetPropertyMetadata).toBeDefined();

    expect(descriptor.injects).toEqual({});
    expect(descriptor.uses).toEqual([]);
    expect(descriptor.metadata).toBeUndefined();
    expect(descriptor.type).toEqual(MyMapper);
    expect(descriptor.instanceResolve).toBeInstanceOf(Function);
  });

  test('ignore unknown properties if ignoreUnknownProperties is set for @Mapper', () => {
    class Source {}
    class Target {
      @Property()
      prop1: string;
    }

    @Mapper({ ignoreUnknownProperties: true })
    class MyMapper {
      @Mapping({ target: 'prop1' })
      @Mapping({ target: 'prop2' })
      @MapMethod({ targetType: Target, sourceType: Source })
      callMe() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);

    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toBeDefined();

    expect(descriptor.mapMethods['callMe']).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop2']).toBeUndefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1']).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].target).toEqual('prop1');
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].source).toEqual('prop1');
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].splitSources).toEqual(['prop1']);
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].transform).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].metadata).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].targetPropertyMetadata).toBeDefined();

    expect(descriptor.injects).toEqual({});
    expect(descriptor.uses).toEqual([]);
    expect(descriptor.metadata).toBeDefined();
    expect(descriptor.type).toEqual(MyMapper);
    expect(descriptor.instanceResolve).toBeInstanceOf(Function);
  });

  test('ignoreUnknownProperties from @MapMethod is higher priority than @Mapper', () => {
    class Source {}
    class Target {
      @Property()
      prop1: string;
    }

    @Mapper({ ignoreUnknownProperties: true })
    class MyMapper {
      @Mapping({ target: 'prop1' })
      @Mapping({ target: 'prop2' })
      @MapMethod({ targetType: Target, sourceType: Source, ignoreUnknownProperties: false })
      callMe() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);

    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toBeDefined();

    expect(descriptor.mapMethods['callMe']).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop2']).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1']).toBeDefined();

    expect(descriptor.injects).toEqual({});
    expect(descriptor.uses).toEqual([]);
    expect(descriptor.metadata).toBeDefined();
    expect(descriptor.type).toEqual(MyMapper);
    expect(descriptor.instanceResolve).toBeInstanceOf(Function);
  });

  test('ignore properties if ignore is set for @Mapping', () => {
    class Source {}
    class Target {
      @Property()
      prop1: string;

      @Property()
      prop2: string;
    }

    class MyMapper {
      @Mapping({ target: 'prop1', ignore: true })
      @MapMethod({ targetType: Target, sourceType: Source })
      callMe() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);

    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toBeDefined();

    expect(descriptor.mapMethods['callMe']).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1']).toBeUndefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop2']).toBeDefined();
  });

  test('custom transform is used while mapping property', () => {
    class Source {}
    class Target {}

    const transformMock = jest.fn();

    class MyMapper {
      @Mapping({ target: 'prop1', transform: transformMock })
      @MapMethod({ targetType: Target, sourceType: Source })
      callMe() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);

    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toBeDefined();

    expect(descriptor.mapMethods['callMe']).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1']).toBeDefined();

    descriptor.mapMethods['callMe'].mappings['prop1'].transform(null, null);
    expect(transformMock).toBeCalledTimes(1);
  });

  test('source property metadata will be mapped if presents', () => {
    class Source {
      @Property()
      prop1: string;
    }
    class Target {}

    class MyMapper {
      @Mapping({ target: 'prop1' })
      @MapMethod({ targetType: Target, sourceType: Source })
      callMe() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);

    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toBeDefined();

    expect(descriptor.mapMethods['callMe']).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1']).toBeDefined();
    expect(descriptor.mapMethods['callMe'].mappings['prop1'].sourcePropertyMetadata).toBeDefined();
  });
});

describe('BeforeMappingDescriptor', () => {
  test('can create before mapping hook for all map methods', () => {
    class Source {}
    class Target {}

    class MyMapper {
      @MapMethod({ targetType: Target, sourceType: Source })
      callMe1() {}

      @MapMethod({ targetType: Target, sourceType: Source })
      callMe2() {}

      @BeforeMapping()
      before() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);

    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toBeDefined();

    expect(descriptor.mapMethods['callMe1']).toBeDefined();
    expect(descriptor.mapMethods['callMe1'].beforeMappingMethods['before']).toBeDefined();
    expect(descriptor.mapMethods['callMe2']).toBeDefined();
    expect(descriptor.mapMethods['callMe2'].beforeMappingMethods['before']).toBeDefined();
  });

  test('can create before mapping hook for specific method name', () => {
    class Source {}
    class Target {}

    class MyMapper {
      @MapMethod({ targetType: Target, sourceType: Source })
      callMe1() {}

      @MapMethod({ targetType: Target, sourceType: Source })
      callMe2() {}

      @BeforeMapping({ methodName: 'callMe2' })
      before() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);

    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toBeDefined();

    expect(descriptor.mapMethods['callMe1']).toBeDefined();
    expect(descriptor.mapMethods['callMe1'].beforeMappingMethods['before']).toBeUndefined();
    expect(descriptor.mapMethods['callMe2']).toBeDefined();
    expect(descriptor.mapMethods['callMe2'].beforeMappingMethods['before']).toBeDefined();
  });

  test('can create before mapping hook for specific target and source types', () => {
    class Source {}
    class Target1 {}
    class Target2 {}

    class MyMapper {
      @MapMethod({ targetType: Target1, sourceType: Source })
      callMe1() {}

      @MapMethod({ targetType: Target2, sourceType: Source })
      callMe2() {}

      @BeforeMapping({ targetType: Target2, sourceType: Source })
      before() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);

    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toBeDefined();

    expect(descriptor.mapMethods['callMe1']).toBeDefined();
    expect(descriptor.mapMethods['callMe1'].beforeMappingMethods['before']).toBeUndefined();
    expect(descriptor.mapMethods['callMe2']).toBeDefined();
    expect(descriptor.mapMethods['callMe2'].beforeMappingMethods['before']).toBeDefined();
  });

  test('can create multiples before mapping hook', () => {
    class Source {}
    class Target {}

    class MyMapper {
      @MapMethod({ targetType: Target, sourceType: Source })
      callMe1() {}

      @BeforeMapping()
      before1() {}

      @BeforeMapping()
      before2() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);

    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toBeDefined();

    expect(descriptor.mapMethods['callMe1']).toBeDefined();
    expect(descriptor.mapMethods['callMe1'].beforeMappingMethods['before1']).toBeDefined();
    expect(descriptor.mapMethods['callMe1'].beforeMappingMethods['before2']).toBeDefined();
  });
});

describe('AfterMappingDescriptor', () => {
  test('can create after mapping hook for all map methods', () => {
    class Source {}
    class Target {}

    class MyMapper {
      @MapMethod({ targetType: Target, sourceType: Source })
      callMe1() {}

      @MapMethod({ targetType: Target, sourceType: Source })
      callMe2() {}

      @AfterMapping()
      after() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);

    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toBeDefined();

    expect(descriptor.mapMethods['callMe1']).toBeDefined();
    expect(descriptor.mapMethods['callMe1'].afterMappingMethods['after']).toBeDefined();
    expect(descriptor.mapMethods['callMe2']).toBeDefined();
    expect(descriptor.mapMethods['callMe2'].afterMappingMethods['after']).toBeDefined();
  });

  test('can create after mapping hook for specific method name', () => {
    class Source {}
    class Target {}

    class MyMapper {
      @MapMethod({ targetType: Target, sourceType: Source })
      callMe1() {}

      @MapMethod({ targetType: Target, sourceType: Source })
      callMe2() {}

      @AfterMapping({ methodName: 'callMe2' })
      after() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);

    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toBeDefined();

    expect(descriptor.mapMethods['callMe1']).toBeDefined();
    expect(descriptor.mapMethods['callMe1'].afterMappingMethods['after']).toBeUndefined();
    expect(descriptor.mapMethods['callMe2']).toBeDefined();
    expect(descriptor.mapMethods['callMe2'].afterMappingMethods['after']).toBeDefined();
  });

  test('can create after mapping hook for specific target and source types', () => {
    class Source {}
    class Target1 {}
    class Target2 {}

    class MyMapper {
      @MapMethod({ targetType: Target1, sourceType: Source })
      callMe1() {}

      @MapMethod({ targetType: Target2, sourceType: Source })
      callMe2() {}

      @AfterMapping({ targetType: Target2, sourceType: Source })
      after() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);

    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toBeDefined();

    expect(descriptor.mapMethods['callMe1']).toBeDefined();
    expect(descriptor.mapMethods['callMe1'].afterMappingMethods['after']).toBeUndefined();
    expect(descriptor.mapMethods['callMe2']).toBeDefined();
    expect(descriptor.mapMethods['callMe2'].afterMappingMethods['after']).toBeDefined();
  });

  test('can create multiple after mapping hook', () => {
    class Source {}
    class Target {}

    class MyMapper {
      @MapMethod({ targetType: Target, sourceType: Source })
      callMe1() {}

      @AfterMapping()
      after1() {}

      @AfterMapping()
      after2() {}
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);

    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toBeDefined();

    expect(descriptor.mapMethods['callMe1']).toBeDefined();
    expect(descriptor.mapMethods['callMe1'].afterMappingMethods['after1']).toBeDefined();
    expect(descriptor.mapMethods['callMe1'].afterMappingMethods['after2']).toBeDefined();
  });
});

describe('InjectDescriptor', () => {
  test('can create inject descriptor with @Inject', () => {
    class InjectMe1 {}
    class InjectMe2 {}
    class InjectMe3 {}
    class InjectMe3Impl extends InjectMe3 {}

    @Mapper([InjectMe2, InjectMe3Impl])
    class MyMapper {
      @Inject(InjectMe1)
      inject1: InjectMe1;

      @Inject(InjectMe2)
      inject2: InjectMe2;

      @Inject(InjectMe3)
      inject3: InjectMe3;
    }

    const descriptor = mapperDescriptorBuilder.build(MyMapper);

    expect(descriptor).toBeDefined();
    expect(descriptor.mapMethods).toBeDefined();

    expect(descriptor.injects['inject1']).toBeDefined();
    expect(descriptor.injects['inject1'].name).toEqual('inject1');
    expect(descriptor.injects['inject1'].type).toEqual(InjectMe1);

    expect(descriptor.injects['inject2']).toBeDefined();
    expect(descriptor.injects['inject2'].name).toEqual('inject2');
    expect(descriptor.injects['inject2'].type).toEqual(InjectMe2);

    expect(descriptor.uses).toHaveLength(3);
    expect(descriptor.uses.map((mapper) => mapper.type).sort()).toEqual([InjectMe1, InjectMe2, InjectMe3Impl].sort());
  });
});
