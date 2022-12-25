import 'reflect-metadata';
import { ObjectMapperFactory } from '../src/object-mapper-factory';
import { Property } from '../src/decorator/property.decorator';
import { MapMethod } from '../src/decorator/map-method.decorator';
import { Mapping } from '../src/decorator/mapping.decorator';
import { Mapper } from '../src/decorator/mapper.decorator';
import { Inject } from '../src/decorator/inject.decorator';
import { BeforeMapping } from '../src/decorator/before-mapping.decorater';
import { AfterMapping } from '../src/decorator/after-mapping.decorater';
import {MappingContext} from "../src/mapping-context";

let objectMapperFactory: ObjectMapperFactory;

beforeEach(() => {
  objectMapperFactory = new ObjectMapperFactory({ debug: true });
});

describe('without hooks', () => {
  describe('simple mapping', () => {
    test('minimal mapping config', () => {
      class Source {
        prop1: string;
        prop2: number;
      }

      class Target {
        @Property()
        prop1: string;

        @Property()
        prop2: number;
      }

      class ObjectMapper {
        @MapMethod({ sourceType: Source, targetType: Target })
        map: (source: Source) => Target;
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = new Source();
      source.prop1 = 'son';
      source.prop2 = 123;

      const target = objectMapper.map(source);
      expect(target).toBeInstanceOf(Target);
      expect(target).toEqual(source);
    });

    test('mapping with different source prop name', () => {
      class Source {
        prop1: string;
        prop3: number;
      }

      class Target {
        @Property()
        prop1: string;

        @Property()
        prop2: number;
      }

      class ObjectMapper {
        @Mapping({ target: 'prop2', source: 'prop3' })
        @MapMethod({ sourceType: Source, targetType: Target })
        map: (source: Source) => Target;
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = new Source();
      source.prop1 = 'son';
      source.prop3 = 123;

      const target = objectMapper.map(source);
      expect(target).toBeInstanceOf(Target);
      expect(target.prop1).toEqual(source.prop1);
      expect(target.prop2).toEqual(source.prop3);
    });

    test('mapping with nested prop', () => {
      class SubSource {
        constructor(public username, public password) {}
      }
      class Source {
        prop1: string;
        prop2: SubSource;
      }

      class Target {
        @Property()
        prop1: string;

        @Property()
        prop2: string;
      }

      class ObjectMapper {
        @Mapping({ target: 'prop2', source: 'prop2.username' })
        @MapMethod({ sourceType: Source, targetType: Target })
        map: (source: Source) => Target;
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = new Source();
      source.prop1 = 'son';
      source.prop2 = new SubSource('son', 'youdontknowme');

      const target = objectMapper.map(source);
      expect(target).toBeInstanceOf(Target);
      expect(target.prop1).toEqual(source.prop1);
      expect(target.prop2).toEqual(source.prop2.username);
    });

    test('mapping without @Property', () => {
      class Source {
        prop1: string;
        prop2: number;
      }

      class Target {
        prop1: string;
        prop2: number;
      }

      class ObjectMapper {
        @Mapping('prop1')
        @Mapping('prop2')
        @MapMethod({ sourceType: Source, targetType: Target })
        map: (source: Source) => Target;
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = new Source();
      source.prop1 = 'son';
      source.prop2 = 123;

      const target = objectMapper.map(source);
      expect(target).toBeInstanceOf(Target);
      expect(target).toEqual(source);
    });

    test('with multiple map methods', () => {
      class Source {
        @Property()
        prop1: string;

        @Property()
        prop2: number;
      }

      class Target {
        @Property()
        prop1: string;

        @Property()
        prop2: number;
      }

      class ObjectMapper {
        @MapMethod({ sourceType: Source, targetType: Target })
        map1: (source: Source) => Target;

        @MapMethod({ sourceType: Target, targetType: Source })
        map2: (source: Target) => Source;
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);

      const source1 = new Source();
      source1.prop1 = 'son';
      source1.prop2 = 123;
      const target1 = objectMapper.map1(source1);
      expect(target1).toBeInstanceOf(Target);
      expect(target1).toEqual(source1);

      const source2 = new Target();
      source2.prop1 = 'noem';
      source2.prop2 = 321;
      const target2 = objectMapper.map2(source2);
      expect(target2).toBeInstanceOf(Source);
      expect(target2).toEqual(source2);
    });

    test('ignore mapping properties', () => {
      class Source {
        prop1: string;
        prop2: number;
      }

      class Target {
        @Property()
        prop1: string;

        @Property()
        prop2: number;
      }

      class ObjectMapper {
        @Mapping({ target: 'prop2', ignore: true })
        @MapMethod({ sourceType: Source, targetType: Target })
        map: (source: Source) => Target;
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = new Source();
      source.prop1 = 'son';
      source.prop2 = 123;

      const target = objectMapper.map(source);
      expect(target).toBeInstanceOf(Target);
      expect(target.prop1).toEqual(source.prop1);
      expect(target.prop2).toBeUndefined();
    });

    test('customize transforming properties', () => {
      class Source {
        prop1: string;
        prop2: number;
      }

      class Target {
        @Property()
        prop1: string;

        @Property()
        prop2: number;
      }

      class ObjectMapper {
        @Mapping({ target: 'prop1', transform: (sourceValue) => `hello ${sourceValue}` })
        @MapMethod({ sourceType: Source, targetType: Target })
        map: (source: Source) => Target;
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = new Source();
      source.prop1 = 'son';
      source.prop2 = 123;

      const target = objectMapper.map(source);
      expect(target).toBeInstanceOf(Target);
      expect(target.prop1).toEqual(`hello ${source.prop1}`);
      expect(target.prop2).toEqual(source.prop2);
    });

    test('customize target creating', () => {
      class Source {
        prop1: string;
        prop2: number;
      }

      class Target {
        @Property()
        prop1: string;

        @Property()
        prop2: number;

        prop3: number;
      }

      class ObjectMapper {
        @MapMethod({
          sourceType: Source,
          targetType: Target,
          targetFactoryFn: (targetType) => {
            const target = new targetType();
            target.prop3 = 'noem';
            return target;
          },
        })
        map: (source: Source) => Target;
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = new Source();
      source.prop1 = 'son';
      source.prop2 = 123;

      const target = objectMapper.map(source);
      expect(target).toBeInstanceOf(Target);
      expect(target.prop1).toEqual(source.prop1);
      expect(target.prop2).toEqual(source.prop2);
      expect(target.prop3).toEqual('noem');
    });

    test('inject required dependencies to fields', () => {
      class Source {
        prop1: string;
        prop2: number;
      }

      class Target {
        @Property()
        prop1: string;

        @Property()
        prop2: number;
      }

      class WelcomeService {
        welcome(name: string) {
          return `welcome ${name}`;
        }
      }
      class UppercaseService {
        uppercase(st: string) {
          return st.toUpperCase();
        }
      }
      class DecorateUppercaseService extends UppercaseService {
        uppercase(st: string): string {
          return `[${super.uppercase(st)}]`;
        }
      }

      @Mapper([DecorateUppercaseService])
      class ObjectMapper {
        @Inject(WelcomeService)
        private welcomeService: WelcomeService;

        @Inject(UppercaseService)
        private uppercaseService: UppercaseService;

        @Mapping({
          target: 'prop1',
          transform: (sourceValue, context) => {
            const self = context.getObjectMapper<ObjectMapper>();
            return self.welcomeService.welcome(self.uppercaseService.uppercase(sourceValue));
          },
        })
        @MapMethod({ sourceType: Source, targetType: Target })
        map: (source: Source) => Target;
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = new Source();
      source.prop1 = 'son';
      source.prop2 = 123;

      const target = objectMapper.map(source);
      expect(target).toBeInstanceOf(Target);
      expect(target.prop1).toEqual(
        new WelcomeService().welcome(new DecorateUppercaseService().uppercase(source.prop1)),
      );
      expect(target.prop2).toEqual(source.prop2);
    });
  });

  describe('use linked mappers', () => {
    class SubSource {
      constructor(public username: string, public password: string) {}
    }
    class Source {
      @Property(SubSource)
      prop1: SubSource;
      @Property()
      prop2: number;
    }

    class SubTarget {
      constructor(public display: string) {}
    }
    class Target {
      @Property(SubTarget)
      prop1: SubTarget;

      @Property()
      prop2: number;
    }

    class SubObjectMapper {
      @Mapping({ target: 'display', source: 'username' })
      @MapMethod({ sourceType: SubSource, targetType: SubTarget })
      map: (source: Source) => Target;
    }

    test('use linked map method if source prop can not assign to target prop', () => {
      @Mapper([SubObjectMapper])
      class ObjectMapper {
        @MapMethod({ sourceType: Source, targetType: Target })
        map: (source: Source) => Target;
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = new Source();
      source.prop1 = new SubSource('son', 'youdontknowme');
      source.prop2 = 123;

      const target = objectMapper.map(source);
      expect(target).toBeInstanceOf(Target);
      expect(target.prop1.display).toEqual(source.prop1.username);
      expect(target.prop2).toEqual(source.prop2);
    });

    test("don't use linked map method if @Mapping is defined", () => {
      @Mapper([SubObjectMapper])
      class ObjectMapper {
        @Mapping('prop1')
        @MapMethod({ sourceType: Source, targetType: Target })
        map: (source: Source) => Target;
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = new Source();
      source.prop1 = new SubSource('son', 'youdontknowme');
      source.prop2 = 123;

      const target = objectMapper.map(source);
      expect(target).toBeInstanceOf(Target);
      expect(target.prop1).toBeInstanceOf(SubSource);
      expect(target.prop1).toEqual(source.prop1);
      expect(target.prop2).toEqual(source.prop2);
    });

    test("don't use linked map method if exact is set in @MapMethod", () => {
      @Mapper([SubObjectMapper])
      class ObjectMapper {
        @MapMethod({ sourceType: Source, targetType: Target, exact: true })
        map: (source: Source) => Target;
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = new Source();
      source.prop1 = new SubSource('son', 'youdontknowme');
      source.prop2 = 123;

      const target = objectMapper.map(source);
      expect(target).toBeInstanceOf(Target);
      expect(target.prop1).toBeInstanceOf(SubSource);
      expect(target.prop1).toEqual(source.prop1);
      expect(target.prop2).toEqual(source.prop2);
    });

    test("don't use linked map method if source and target types are not exact the same", () => {
      class MySubSource extends SubSource {}
      class SubObjectMapper {
        @Mapping({ target: 'display', source: 'username' })
        @MapMethod({ sourceType: MySubSource, targetType: SubTarget })
        map: (source: Source) => Target;
      }

      @Mapper([SubObjectMapper])
      class ObjectMapper {
        @MapMethod({ sourceType: Source, targetType: Target })
        map: (source: Source) => Target;
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = new Source();
      source.prop1 = new MySubSource('son', 'youdontknowme');
      source.prop2 = 123;

      const target = objectMapper.map(source);
      expect(target).toBeInstanceOf(Target);
      expect(target.prop1).toBeInstanceOf(SubSource);
      expect(target.prop1).toEqual(source.prop1);
      expect(target.prop2).toEqual(source.prop2);
    });

    test('inject dependencies to fields for linked mappers', () => {
      class WelcomeService {
        welcome(name: string) {
          return `welcome ${name}`;
        }
      }
      class ComputeService {
        compute(val: number) {
          return val + 1;
        }
      }

      class SubObjectMapper {
        @Inject(WelcomeService)
        private welcomeService: WelcomeService;

        @Mapping({
          target: 'display',
          source: 'username',
          transform: (sourceValue, context) => {
            const self = context.getObjectMapper<SubObjectMapper>();
            return self.welcomeService.welcome(sourceValue);
          },
        })
        @MapMethod({ sourceType: SubSource, targetType: SubTarget })
        map: (source: Source) => Target;
      }

      @Mapper([SubObjectMapper])
      class ObjectMapper {
        @Inject(ComputeService)
        private computeService: ComputeService;

        @Mapping({
          target: 'prop2',
          transform: (sourceValue, context) => {
            const self = context.getObjectMapper<ObjectMapper>();
            return self.computeService.compute(sourceValue);
          },
        })
        @MapMethod({ sourceType: Source, targetType: Target })
        map: (source: Source) => Target;
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = new Source();
      source.prop1 = new SubSource('son', 'youdontknowme');
      source.prop2 = 123;

      const target = objectMapper.map(source);
      expect(target).toBeInstanceOf(Target);
      expect(target.prop1.display).toEqual(new WelcomeService().welcome(source.prop1.username));
      expect(target.prop2).toEqual(source.prop2 + 1);
    });
  });
});

describe('with hooks', () => {
  describe('simple mapping', () => {
    describe('before hook', () => {
      test('simple before hook', () => {
        const beforeMock = jest.fn();

        class ObjectMapper {
          @MapMethod({ includes: [['prop3', 'prop1']] })
          map: (source: object) => object;

          @BeforeMapping()
          before(context: MappingContext) {
            beforeMock(context);
          }
        }

        const objectMapper = objectMapperFactory.create(ObjectMapper);
        const source = {
          prop1: 'son',
          prop2: 123,
        };

        const target = objectMapper.map(source);
        expect(target).toEqual({
          ...source,
          prop3: source.prop1,
        });
        expect(beforeMock).toBeCalledTimes(1);
        expect(beforeMock.mock.calls[0][0]).toBeDefined();
        expect(beforeMock.mock.calls[0][0].methodDescriptor).toBeDefined();
      });

      test('multiple before hooks', () => {
        const beforeMock1 = jest.fn();
        const beforeMock2 = jest.fn();

        class ObjectMapper {
          @MapMethod({ includes: [['prop3', 'prop1']] })
          map: (source: object) => object;

          @BeforeMapping()
          before1(context: MappingContext) {
            beforeMock1(context);
          }

          @BeforeMapping()
          before2(context: MappingContext) {
            beforeMock2(context);
          }
        }

        const objectMapper = objectMapperFactory.create(ObjectMapper);
        const source = {
          prop1: 'son',
          prop2: 123,
        };

        const target = objectMapper.map(source);
        expect(target).toEqual({
          ...source,
          prop3: source.prop1,
        });

        expect(beforeMock1).toBeCalledTimes(1);
        expect(beforeMock1.mock.calls[0][0]).toBeDefined();
        expect(beforeMock1.mock.calls[0][0].methodDescriptor).toBeDefined();

        expect(beforeMock2).toBeCalledTimes(1);
        expect(beforeMock2.mock.calls[0][0]).toBeDefined();
        expect(beforeMock2.mock.calls[0][0].methodDescriptor).toBeDefined();
      });

      test('before hook for all map methods', () => {
        const beforeMock = jest.fn();

        class ObjectMapper {
          @MapMethod({ includes: [['prop3', 'prop1']] })
          map1: (source: object) => object;

          @MapMethod({ includes: [['prop4', 'prop1']] })
          map2: (source: object) => object;

          @BeforeMapping(true)
          before(context: MappingContext) {
            beforeMock(context);
          }
        }

        const objectMapper = objectMapperFactory.create(ObjectMapper);
        const source = {
          prop1: 'son',
          prop2: 123,
        };

        const target1 = objectMapper.map1(source);
        expect(target1).toEqual({
          ...source,
          prop3: source.prop1,
        });

        expect(beforeMock).toBeCalledTimes(1);
        expect(beforeMock.mock.calls[0][0]).toBeDefined();
        expect(beforeMock.mock.calls[0][0].methodDescriptor).toBeDefined();

        const target2 = objectMapper.map2(source);
        expect(target2).toEqual({
          ...source,
          prop4: source.prop1,
        });

        expect(beforeMock).toBeCalledTimes(2);
        expect(beforeMock.mock.calls[0][0]).toBeDefined();
        expect(beforeMock.mock.calls[0][0].methodDescriptor).toBeDefined();
      });

      test('before hook with specific map method name', () => {
        const beforeMock1 = jest.fn();
        const beforeMock2 = jest.fn();

        class ObjectMapper {
          @MapMethod({ includes: [['prop3', 'prop1']] })
          map1: (source: object) => object;

          @MapMethod({ includes: [['prop4', 'prop1']] })
          map2: (source: object) => object;

          @BeforeMapping('map1')
          before1(context: MappingContext) {
            beforeMock1(context);
          }

          @BeforeMapping('map2')
          before2(context: MappingContext) {
            beforeMock2(context);
          }
        }

        const objectMapper = objectMapperFactory.create(ObjectMapper);
        const source = {
          prop1: 'son',
          prop2: 123,
        };

        const target1 = objectMapper.map1(source);
        expect(target1).toEqual({
          ...source,
          prop3: source.prop1,
        });

        expect(beforeMock1).toBeCalledTimes(1);
        expect(beforeMock1.mock.calls[0][0]).toBeDefined();
        expect(beforeMock1.mock.calls[0][0].methodDescriptor).toBeDefined();
        expect(beforeMock2).not.toBeCalled();

        const target2 = objectMapper.map2(source);
        expect(target2).toEqual({
          ...source,
          prop4: source.prop1,
        });

        expect(beforeMock1).toBeCalledTimes(1);
        expect(beforeMock2).toBeCalledTimes(1);
        expect(beforeMock2.mock.calls[0][0]).toBeDefined();
        expect(beforeMock2.mock.calls[0][0].methodDescriptor).toBeDefined();
      });

      test('before hook with specific target and source type', () => {
        const beforeMock1 = jest.fn();
        const beforeMock2 = jest.fn();

        class Target1 {}
        class Source1 {}
        class Target2 {}
        class Source2 {}

        class ObjectMapper {
          @MapMethod([Target1, Source1])
          map1: (source: object) => object;

          @MapMethod([Target2, Source2])
          map2: (source: object) => object;

          @BeforeMapping([Target1, Source1])
          before1(context: MappingContext) {
            beforeMock1(context);
          }

          @BeforeMapping([Target2, Source2])
          before2(context: MappingContext) {
            beforeMock2(context);
          }
        }

        const objectMapper = objectMapperFactory.create(ObjectMapper);
        const source = {
          prop1: 'son',
          prop2: 123,
        };

        objectMapper.map1(source);

        expect(beforeMock1).toBeCalledTimes(1);
        expect(beforeMock1.mock.calls[0][0]).toBeDefined();
        expect(beforeMock1.mock.calls[0][0].methodDescriptor).toBeDefined();
        expect(beforeMock2).not.toBeCalled();

        objectMapper.map2(source);

        expect(beforeMock1).toBeCalledTimes(1);
        expect(beforeMock2).toBeCalledTimes(1);
        expect(beforeMock2.mock.calls[0][0]).toBeDefined();
        expect(beforeMock2.mock.calls[0][0].methodDescriptor).toBeDefined();
      });

      test('before hook with mixing target-source type and map method name', () => {
        const beforeMock1 = jest.fn();
        const beforeMock2 = jest.fn();

        class Target1 {}
        class Source1 {}
        class Target2 {}
        class Source2 {}

        class ObjectMapper {
          @MapMethod([Target1, Source1])
          map1: (source: object) => object;

          @MapMethod([Target2, Source2])
          map2: (source: object) => object;

          @BeforeMapping([Target1, Source1])
          before1(context: MappingContext) {
            beforeMock1(context);
          }

          @BeforeMapping('map2')
          before2(context: MappingContext) {
            beforeMock2(context);
          }
        }

        const objectMapper = objectMapperFactory.create(ObjectMapper);
        const source = {
          prop1: 'son',
          prop2: 123,
        };

        objectMapper.map1(source);

        expect(beforeMock1).toBeCalledTimes(1);
        expect(beforeMock1.mock.calls[0][0]).toBeDefined();
        expect(beforeMock1.mock.calls[0][0].methodDescriptor).toBeDefined();
        expect(beforeMock2).not.toBeCalled();

        objectMapper.map2(source);

        expect(beforeMock1).toBeCalledTimes(1);
        expect(beforeMock2).toBeCalledTimes(1);
        expect(beforeMock2.mock.calls[0][0]).toBeDefined();
        expect(beforeMock2.mock.calls[0][0].methodDescriptor).toBeDefined();
      });
    });

    describe('after hook', () => {
      test('simple after hook', () => {
        const afterMock = jest.fn();

        class ObjectMapper {
          @MapMethod({ includes: [['prop3', 'prop1']] })
          map: (source: object) => object;

          @AfterMapping()
          after(context: MappingContext) {
            afterMock(context);
          }
        }

        const objectMapper = objectMapperFactory.create(ObjectMapper);
        const source = {
          prop1: 'son',
          prop2: 123,
        };

        const target = objectMapper.map(source);
        expect(target).toEqual({
          ...source,
          prop3: source.prop1,
        });
        expect(afterMock).toBeCalledTimes(1);
        expect(afterMock.mock.calls[0][0]).toBeDefined();
        expect(afterMock.mock.calls[0][0].methodDescriptor).toBeDefined();
      });

      test('multiple after hooks', () => {
        const afterMock1 = jest.fn();
        const afterMock2 = jest.fn();

        class ObjectMapper {
          @MapMethod({ includes: [['prop3', 'prop1']] })
          map: (source: object) => object;

          @AfterMapping()
          after1(context: MappingContext) {
            afterMock1(context);
          }

          @AfterMapping()
          after2(context: MappingContext) {
            afterMock2(context);
          }
        }

        const objectMapper = objectMapperFactory.create(ObjectMapper);
        const source = {
          prop1: 'son',
          prop2: 123,
        };

        const target = objectMapper.map(source);
        expect(target).toEqual({
          ...source,
          prop3: source.prop1,
        });

        expect(afterMock1).toBeCalledTimes(1);
        expect(afterMock1.mock.calls[0][0]).toBeDefined();
        expect(afterMock1.mock.calls[0][0].methodDescriptor).toBeDefined();

        expect(afterMock2).toBeCalledTimes(1);
        expect(afterMock2.mock.calls[0][0]).toBeDefined();
        expect(afterMock2.mock.calls[0][0].methodDescriptor).toBeDefined();
      });

      test('after hook with specific map method name', () => {
        const afterMock1 = jest.fn();
        const afterMock2 = jest.fn();

        class ObjectMapper {
          @MapMethod({ includes: [['prop3', 'prop1']] })
          map1: (source: object) => object;

          @MapMethod({ includes: [['prop4', 'prop1']] })
          map2: (source: object) => object;

          @AfterMapping('map1')
          after1(context: MappingContext) {
            afterMock1(context);
          }

          @AfterMapping('map2')
          after2(context: MappingContext) {
            afterMock2(context);
          }
        }

        const objectMapper = objectMapperFactory.create(ObjectMapper);
        const source = {
          prop1: 'son',
          prop2: 123,
        };

        const target1 = objectMapper.map1(source);
        expect(target1).toEqual({
          ...source,
          prop3: source.prop1,
        });

        expect(afterMock1).toBeCalledTimes(1);
        expect(afterMock1.mock.calls[0][0]).toBeDefined();
        expect(afterMock1.mock.calls[0][0].methodDescriptor).toBeDefined();
        expect(afterMock2).not.toBeCalled();

        const target2 = objectMapper.map2(source);
        expect(target2).toEqual({
          ...source,
          prop4: source.prop1,
        });

        expect(afterMock1).toBeCalledTimes(1);
        expect(afterMock2).toBeCalledTimes(1);
        expect(afterMock2.mock.calls[0][0]).toBeDefined();
        expect(afterMock2.mock.calls[0][0].methodDescriptor).toBeDefined();
      });

      test('after hook with specific target and source type', () => {
        const afterMock1 = jest.fn();
        const afterMock2 = jest.fn();

        class Target1 {}
        class Source1 {}
        class Target2 {}
        class Source2 {}

        class ObjectMapper {
          @MapMethod([Target1, Source1])
          map1: (source: object) => object;

          @MapMethod([Target2, Source2])
          map2: (source: object) => object;

          @AfterMapping([Target1, Source1])
          after1(context: MappingContext) {
            afterMock1(context);
          }

          @AfterMapping([Target2, Source2])
          after2(context: MappingContext) {
            afterMock2(context);
          }
        }

        const objectMapper = objectMapperFactory.create(ObjectMapper);
        const source = {
          prop1: 'son',
          prop2: 123,
        };

        objectMapper.map1(source);

        expect(afterMock1).toBeCalledTimes(1);
        expect(afterMock1.mock.calls[0][0]).toBeDefined();
        expect(afterMock1.mock.calls[0][0].methodDescriptor).toBeDefined();
        expect(afterMock2).not.toBeCalled();

        objectMapper.map2(source);

        expect(afterMock1).toBeCalledTimes(1);
        expect(afterMock2).toBeCalledTimes(1);
        expect(afterMock2.mock.calls[0][0]).toBeDefined();
        expect(afterMock2.mock.calls[0][0].methodDescriptor).toBeDefined();
      });

      test('after hook with mixing target-source type and map method name', () => {
        const afterMock1 = jest.fn();
        const afterMock2 = jest.fn();

        class Target1 {}
        class Source1 {}
        class Target2 {}
        class Source2 {}

        class ObjectMapper {
          @MapMethod([Target1, Source1])
          map1: (source: object) => object;

          @MapMethod([Target2, Source2])
          map2: (source: object) => object;

          @AfterMapping([Target1, Source1])
          after1(context: MappingContext) {
            afterMock1(context);
          }

          @AfterMapping('map2')
          after2(context: MappingContext) {
            afterMock2(context);
          }
        }

        const objectMapper = objectMapperFactory.create(ObjectMapper);
        const source = {
          prop1: 'son',
          prop2: 123,
        };

        objectMapper.map1(source);

        expect(afterMock1).toBeCalledTimes(1);
        expect(afterMock1.mock.calls[0][0]).toBeDefined();
        expect(afterMock1.mock.calls[0][0].methodDescriptor).toBeDefined();
        expect(afterMock2).not.toBeCalled();

        objectMapper.map2(source);

        expect(afterMock1).toBeCalledTimes(1);
        expect(afterMock2).toBeCalledTimes(1);
        expect(afterMock2.mock.calls[0][0]).toBeDefined();
        expect(afterMock2.mock.calls[0][0].methodDescriptor).toBeDefined();
      });

      test('after hook with override target value', () => {
        const overrideTarget = {
          prop10: 123,
        };
        const afterMock = jest.fn((context) => overrideTarget);

        class ObjectMapper {
          @MapMethod({ includes: [['prop3', 'prop1']] })
          map: (source: object) => object;

          @AfterMapping()
          after(context: MappingContext) {
            return afterMock(context);
          }
        }

        const objectMapper = objectMapperFactory.create(ObjectMapper);
        const source = {
          prop1: 'son',
          prop2: 123,
        };

        const target = objectMapper.map(source);
        expect(target).toEqual(overrideTarget);
        expect(afterMock).toBeCalledTimes(1);
        expect(afterMock.mock.calls[0][0]).toBeDefined();
        expect(afterMock.mock.calls[0][0].methodDescriptor).toBeDefined();
      });

      test('with multiple override target of after hooks then accept overriding for the first one only', () => {
        const overrideTarget1 = {
          prop10: 123,
        };
        const overrideTarget2 = {
          prop11: 'tranxuanson',
        };
        const afterMock1 = jest.fn((context) => overrideTarget1);
        const afterMock2 = jest.fn((context) => overrideTarget2);

        class ObjectMapper {
          @MapMethod({ includes: [['prop3', 'prop1']] })
          map: (source: object) => object;

          @AfterMapping()
          after1(context: MappingContext) {
            return afterMock1(context);
          }

          @AfterMapping()
          after2(context: MappingContext) {
            return afterMock2(context);
          }
        }

        const objectMapper = objectMapperFactory.create(ObjectMapper);
        const source = {
          prop1: 'son',
          prop2: 123,
        };

        const target = objectMapper.map(source);
        expect(target).toEqual(overrideTarget1);
        expect(afterMock1).toBeCalledTimes(1);
        expect(afterMock1.mock.calls[0][0]).toBeDefined();
        expect(afterMock1.mock.calls[0][0].methodDescriptor).toBeDefined();
        expect(afterMock2).toBeCalledTimes(1);
        expect(afterMock2.mock.calls[0][0]).toBeDefined();
        expect(afterMock2.mock.calls[0][0].methodDescriptor).toBeDefined();
      });

      test('with multiple override target of different after hooks then accept overriding for corresponding map methods', () => {
        const overrideTarget1 = {
          prop10: 123,
        };
        const overrideTarget2 = {
          prop11: 'tranxuanson',
        };
        const afterMock1 = jest.fn((context) => overrideTarget1);
        const afterMock2 = jest.fn((context) => overrideTarget2);

        class ObjectMapper {
          @MapMethod({ includes: [['prop3', 'prop1']] })
          map1: (source: object) => object;

          @MapMethod({ includes: [['prop4', 'prop1']] })
          map2: (source: object) => object;

          @AfterMapping('map1')
          after1(context: MappingContext) {
            return afterMock1(context);
          }

          @AfterMapping('map2')
          after2(context: MappingContext) {
            return afterMock2(context);
          }
        }

        const objectMapper = objectMapperFactory.create(ObjectMapper);
        const source = {
          prop1: 'son',
          prop2: 123,
        };

        const target1 = objectMapper.map1(source);
        expect(target1).toEqual(overrideTarget1);

        expect(afterMock1).toBeCalledTimes(1);
        expect(afterMock1.mock.calls[0][0]).toBeDefined();
        expect(afterMock1.mock.calls[0][0].methodDescriptor).toBeDefined();
        expect(afterMock2).not.toBeCalled();

        const target2 = objectMapper.map2(source);
        expect(target2).toEqual(overrideTarget2);

        expect(afterMock1).toBeCalledTimes(1);
        expect(afterMock2).toBeCalledTimes(1);
        expect(afterMock2.mock.calls[0][0]).toBeDefined();
        expect(afterMock2.mock.calls[0][0].methodDescriptor).toBeDefined();
      });
    });

    test("'before' hooks should be called before 'after' hooks", () => {
      const beforeMock = jest.fn();
      const afterMock = jest.fn();

      class ObjectMapper {
        @MapMethod({ includes: [['prop3', 'prop1']] })
        map: (source: object) => object;

        @BeforeMapping()
        before(context: MappingContext) {
          beforeMock(context);
        }

        @AfterMapping()
        after(context: MappingContext) {
          afterMock(context);
        }
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = {
        prop1: 'son',
        prop2: 123,
      };

      const target = objectMapper.map(source);
      expect(target).toEqual({
        ...source,
        prop3: source.prop1,
      });
      expect(beforeMock).toBeCalledTimes(1);
      expect(beforeMock.mock.calls[0][0]).toBeDefined();
      expect(beforeMock.mock.calls[0][0].methodDescriptor).toBeDefined();
      expect(afterMock).toBeCalledTimes(1);
      expect(afterMock.mock.calls[0][0]).toBeDefined();
      expect(afterMock.mock.calls[0][0].methodDescriptor).toBeDefined();
      expect(beforeMock.mock.invocationCallOrder[0]).toBeLessThan(afterMock.mock.invocationCallOrder[0]);
    });

    test("'after' hook can override target when use with 'before' hook", () => {
      const overrideTarget = {
        prop10: 123,
      };
      const beforeMock = jest.fn();
      const afterMock = jest.fn((context) => overrideTarget);

      class ObjectMapper {
        @MapMethod({ includes: [['prop3', 'prop1']] })
        map: (source: object) => object;

        @BeforeMapping()
        before(context: MappingContext) {
          beforeMock(context);
        }

        @AfterMapping()
        after(context: MappingContext) {
          return afterMock(context);
        }
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = {
        prop1: 'son',
        prop2: 123,
      };

      const target = objectMapper.map(source);
      expect(target).toEqual(overrideTarget);
      expect(beforeMock).toBeCalledTimes(1);
      expect(beforeMock.mock.calls[0][0]).toBeDefined();
      expect(beforeMock.mock.calls[0][0].methodDescriptor).toBeDefined();
      expect(afterMock).toBeCalledTimes(1);
      expect(afterMock.mock.calls[0][0]).toBeDefined();
      expect(afterMock.mock.calls[0][0].methodDescriptor).toBeDefined();
      expect(beforeMock.mock.invocationCallOrder[0]).toBeLessThan(afterMock.mock.invocationCallOrder[0]);
    });

    test('inject fields can be call inside hooks', () => {
      const beforeMock = jest.fn();
      const afterMock = jest.fn();

      class WelcomeService {
        welcome(name: string) {
          return `welcome ${name}`;
        }
      }

      class ObjectMapper {
        @Inject(WelcomeService)
        private welcomeService: WelcomeService;

        @MapMethod({ includes: [['prop3', 'prop1']] })
        map: (source: object) => object;

        @BeforeMapping()
        before() {
          beforeMock(this.welcomeService);
        }

        @AfterMapping()
        after() {
          afterMock(this.welcomeService);
        }
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = {
        prop1: 'son',
        prop2: 123,
      };

      const target = objectMapper.map(source);
      expect(target).toEqual({
        ...source,
        prop3: source.prop1,
      });
      expect(beforeMock).toBeCalledTimes(1);
      expect(beforeMock.mock.calls[0][0]).toBeInstanceOf(WelcomeService);
      expect(afterMock).toBeCalledTimes(1);
      expect(afterMock.mock.calls[0][0]).toBeInstanceOf(WelcomeService);
    });
  });

  describe('use linked mappers', () => {
    const linkedBeforeMock = jest.fn();
    const beforeMock = jest.fn();
    const linkedAfterMock = jest.fn();
    const afterMock = jest.fn();

    class SubSource {
      constructor(public username: string, public password: string) {}
    }
    class Source {
      @Property(SubSource)
      prop1: SubSource;
      @Property()
      prop2: number;
    }

    class SubTarget {
      constructor(public display: string) {}
    }
    class Target {
      @Property(SubTarget)
      prop1: SubTarget;

      @Property()
      prop2: number;
    }

    class SubObjectMapper {
      @Mapping({ target: 'display', source: 'username' })
      @MapMethod({ sourceType: SubSource, targetType: SubTarget })
      map: (source: SubSource) => SubTarget;

      @BeforeMapping()
      linkedBefore(context: MappingContext) {
        linkedBeforeMock(context);
      }

      @AfterMapping()
      linkedAfter(context: MappingContext) {
        linkedAfterMock(context);
      }
    }

    beforeEach(() => {
      linkedBeforeMock.mockClear();
      beforeMock.mockClear();
      linkedAfterMock.mockClear();
      afterMock.mockClear();
    });

    test('before hooks should be called inside linked mappers', () => {
      @Mapper([SubObjectMapper])
      class ObjectMapper {
        @MapMethod({ sourceType: Source, targetType: Target })
        map: (source: Source) => Target;

        @BeforeMapping()
        before(context: MappingContext) {
          beforeMock(context);
        }
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = new Source();
      source.prop1 = new SubSource('son', 'youdontknowme');
      source.prop2 = 123;

      const target = objectMapper.map(source);
      expect(target).toBeInstanceOf(Target);
      expect(target.prop1.display).toEqual(source.prop1.username);
      expect(target.prop2).toEqual(source.prop2);
      expect(beforeMock).toBeCalledTimes(1);
      expect(linkedBeforeMock).toBeCalledTimes(1);

      const beforeContext = beforeMock.mock.calls[0][0];
      const linkedBeforeContext = linkedBeforeMock.mock.calls[0][0];
      expect(beforeContext.sourceType).not.toEqual(linkedBeforeContext.sourceType);
      expect(beforeContext.targetType).not.toEqual(linkedBeforeContext.targetType);
      expect(beforeContext.methodDescriptor).not.toEqual(linkedBeforeContext.methodDescriptor);
      expect(beforeContext.options).toEqual(linkedBeforeContext.options);
    });

    test('after hooks should be called inside linked mappers', () => {
      @Mapper([SubObjectMapper])
      class ObjectMapper {
        @MapMethod({ sourceType: Source, targetType: Target })
        map: (source: Source) => Target;

        @AfterMapping()
        after(context: MappingContext) {
          afterMock(context);
        }
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = new Source();
      source.prop1 = new SubSource('son', 'youdontknowme');
      source.prop2 = 123;

      const target = objectMapper.map(source);
      expect(target).toBeInstanceOf(Target);
      expect(target.prop1.display).toEqual(source.prop1.username);
      expect(target.prop2).toEqual(source.prop2);
      expect(afterMock).toBeCalledTimes(1);
      expect(linkedAfterMock).toBeCalledTimes(1);

      const afterContext = afterMock.mock.calls[0][0];
      const linkedAfterContext = linkedAfterMock.mock.calls[0][0];
      expect(afterContext.sourceType).not.toEqual(linkedAfterContext.sourceType);
      expect(afterContext.targetType).not.toEqual(linkedAfterContext.targetType);
      expect(afterContext.methodDescriptor).not.toEqual(linkedAfterContext.methodDescriptor);
      expect(afterContext.options).toEqual(linkedAfterContext.options);
    });

    test('after hook is called inside linked mapper can override linked mapper target', () => {
      const overrideTarget = {
        prop10: 123
      }
      const linkedAfterMock1 = jest.fn((context) => overrideTarget)

      class SubObjectMapper1 {
        @Mapping({ target: 'display', source: 'username' })
        @MapMethod({ sourceType: SubSource, targetType: SubTarget })
        map: (source: SubSource) => SubTarget;

        @BeforeMapping()
        linkedBefore(context: MappingContext) {
          linkedBeforeMock(context);
        }

        @AfterMapping()
        linkedAfter(context: MappingContext) {
          return linkedAfterMock1(context);
        }
      }

      @Mapper([SubObjectMapper1])
      class ObjectMapper {
        @MapMethod({ sourceType: Source, targetType: Target })
        map: (source: Source) => Target;

        @AfterMapping()
        after(context: MappingContext) {
          afterMock(context);
        }
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = new Source();
      source.prop1 = new SubSource('son', 'youdontknowme');
      source.prop2 = 123;

      const target = objectMapper.map(source);
      expect(target).toBeInstanceOf(Target);
      expect(target.prop1).toEqual(overrideTarget);
      expect(target.prop2).toEqual(source.prop2);
      expect(afterMock).toBeCalledTimes(1);
      expect(linkedAfterMock1).toBeCalledTimes(1);

      const afterContext = afterMock.mock.calls[0][0];
      const linkedAfterContext = linkedAfterMock1.mock.calls[0][0];
      expect(afterContext.sourceType).not.toEqual(linkedAfterContext.sourceType);
      expect(afterContext.targetType).not.toEqual(linkedAfterContext.targetType);
      expect(afterContext.methodDescriptor).not.toEqual(linkedAfterContext.methodDescriptor);
      expect(afterContext.options).toEqual(linkedAfterContext.options);
    });

    test('both before and after hooks should be called inside linked mappers', () => {
      @Mapper([SubObjectMapper])
      class ObjectMapper {
        @MapMethod({ sourceType: Source, targetType: Target })
        map: (source: Source) => Target;

        @BeforeMapping()
        before(context: MappingContext) {
          beforeMock(context);
        }

        @AfterMapping()
        after(context: MappingContext) {
          afterMock(context);
        }
      }

      const objectMapper = objectMapperFactory.create(ObjectMapper);
      const source = new Source();
      source.prop1 = new SubSource('son', 'youdontknowme');
      source.prop2 = 123;

      const target = objectMapper.map(source);
      expect(target).toBeInstanceOf(Target);
      expect(target.prop1.display).toEqual(source.prop1.username);
      expect(target.prop2).toEqual(source.prop2);

      expect(afterMock).toBeCalledTimes(1);
      expect(linkedAfterMock).toBeCalledTimes(1);

      const afterContext = afterMock.mock.calls[0][0];
      const afterLinkedContext = linkedAfterMock.mock.calls[0][0];
      expect(afterContext.sourceType).not.toEqual(afterLinkedContext.sourceType);
      expect(afterContext.targetType).not.toEqual(afterLinkedContext.targetType);
      expect(afterContext.methodDescriptor).not.toEqual(afterLinkedContext.methodDescriptor);
      expect(afterContext.options).toEqual(afterLinkedContext.options);

      const beforeContext = beforeMock.mock.calls[0][0];
      const linkedBeforeContext = linkedBeforeMock.mock.calls[0][0];

      expect(beforeMock).toBeCalledTimes(1);
      expect(linkedBeforeMock).toBeCalledTimes(1);
      expect(beforeContext.sourceType).not.toEqual(linkedBeforeContext.sourceType);
      expect(beforeContext.targetType).not.toEqual(linkedBeforeContext.targetType);
      expect(beforeContext.methodDescriptor).not.toEqual(linkedBeforeContext.methodDescriptor);
      expect(beforeContext.options).toEqual(linkedBeforeContext.options);

      expect(beforeContext.sourceType).toEqual(afterContext.sourceType);
      expect(beforeContext.targetType).toEqual(afterContext.targetType);
      expect(beforeContext.methodDescriptor).toEqual(afterContext.methodDescriptor);
    });
  });
});

describe('anonymous mapping', () => {
  test('can map target with an anonymous source', () => {
    class Target {
      @Property()
      prop1: string;

      @Property()
      prop2: number;
    }

    class ObjectMapper {
      @MapMethod({ targetType: Target })
      map: (source: object) => Target;
    }

    const objectMapper = objectMapperFactory.create(ObjectMapper);
    const source = {
      prop1: 'son',
      prop2: 123,
    };

    const target = objectMapper.map(source);
    expect(target).toBeInstanceOf(Target);
    expect(target).toEqual(source);
  });

  test('can map target with an anonymous source without @Property', () => {
    class Target {
      prop1: string;
      prop2: number;
    }

    class ObjectMapper {
      @Mapping('prop1')
      @Mapping('prop2')
      @MapMethod(Target)
      map: (source: object) => Target;
    }

    const objectMapper = objectMapperFactory.create(ObjectMapper);
    const source = {
      prop1: 'son',
      prop2: 123,
    };

    const target = objectMapper.map(source);
    expect(target).toBeInstanceOf(Target);
    expect(target).toEqual(source);
  });

  test('with both anonymous source and target then map all specific properties', () => {
    class ObjectMapper {
      @MapMethod({ properties: ['prop1', ['prop2', 'prop2.name1'], { target: 'prop3', source: 'prop2.name2' }] })
      map: (source: object) => object;
    }

    const objectMapper = objectMapperFactory.create(ObjectMapper);
    const source = {
      prop1: 'son',
      prop2: {
        name1: 'tran',
        name2: 'xuan',
      },
    };

    const target = objectMapper.map(source);
    expect(target).toEqual({
      prop1: source.prop1,
      prop2: source.prop2.name1,
      prop3: source.prop2.name2,
    });
  });

  test('with both anonymous source and target then map all properties excludes some specific properties', () => {
    class ObjectMapper {
      @MapMethod({ excludes: ['prop1', 'prop2'] })
      map: (source: object) => object;
    }

    const objectMapper = objectMapperFactory.create(ObjectMapper);
    const source = {
      prop1: 'son',
      prop2: {
        name1: 'tran',
        name2: 'xuan',
      },
      prop3: 123,
    };

    const target = objectMapper.map(source);
    expect(target).toEqual({
      prop3: source.prop3,
    });
  });

  test('with both anonymous source and target then map all properties and additional specific properties', () => {
    class ObjectMapper {
      @MapMethod({ includes: [['prop3', 'prop2.name1'], { target: 'prop4', source: 'prop2.name2' }] })
      map: (source: object) => object;
    }

    const objectMapper = objectMapperFactory.create(ObjectMapper);
    const source = {
      prop1: 'son',
      prop2: {
        name1: 'tran',
        name2: 'xuan',
      },
    };

    const target = objectMapper.map(source);
    expect(target).toEqual({
      prop1: source.prop1,
      prop2: source.prop2,
      prop3: source.prop2.name1,
      prop4: source.prop2.name2,
    });
  });
});
