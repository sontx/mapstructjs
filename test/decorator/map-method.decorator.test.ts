import { MAP_METHOD_METADATA } from '../../src/constants';

import 'reflect-metadata';
import { MapMethod, MapMethodRawConfig } from '../../src/decorator/map-method.decorator';

class Source {}
class Target {}

test('with valid config then inject to target metadata', () => {
  const config1: MapMethodRawConfig = {
    sourceType: Source,
    targetType: Target,
  };

  const config2: MapMethodRawConfig = {
    sourceType: Source,
    targetType: Target,
    exact: true,
  };

  class Test {
    @MapMethod(config1)
    map1: () => void;

    @MapMethod(config2)
    map2: () => void;
  }

  const metadata = Reflect.getMetadata(MAP_METHOD_METADATA, Test);

  expect(metadata).toBeDefined();
  expect(metadata.map1).toEqual(config1);
  expect(metadata.map2).toEqual(config2);
});

test('with sourceType and targetType are the same then throw an error', () => {
  expect(() => {
    class Test {
      @MapMethod({
        sourceType: Source,
        targetType: Source,
      })
      map1: () => void;
    }
  }).toThrow(TypeError);
});

test('with an empty config then throw an error', () => {
  expect(() => {
    class Test {
      @MapMethod({})
      map1: () => void;
    }
  }).toThrow(TypeError);
});

test('if define both includes, excludes, properties or targetType then throw an error', () => {
  expect(() => {
    class Test {
      @MapMethod({ excludes: [], properties: [] })
      map1: () => void;
    }
  }).toThrow(TypeError);

  class Target {}
  expect(() => {
    class Test {
      @MapMethod({ excludes: [], targetType: Target })
      map1: () => void;
    }
  }).toThrow(TypeError);
});

test('raw config should be normalized when inject to metadata', () => {
  class Test {
    @MapMethod({
      excludes: ['prop1', 'prop2'],
    })
    map1: () => void;

    @MapMethod({
      includes: [['prop1', 'prop1.name'], { target: 'prop2', source: 'prop2.age' }],
    })
    map2: () => void;

    @MapMethod({
      properties: ['prop1', ['prop2', 'prop2'], { target: 'prop3', source: 'prop3' }],
    })
    map3: () => void;
  }

  const metadata = Reflect.getMetadata(MAP_METHOD_METADATA, Test);

  expect(metadata).toBeDefined();

  expect(metadata['map1']).toBeDefined();
  expect(metadata['map1'].excludes).toBeDefined();
  expect(metadata['map1'].excludes).toEqual({ prop1: true, prop2: true });

  expect(metadata['map2']).toBeDefined();
  expect(metadata['map2'].includes).toBeDefined();
  expect(metadata['map2'].includes.sort()).toEqual(
    [
      { target: 'prop1', source: 'prop1.name' },
      { target: 'prop2', source: 'prop2.age' },
    ].sort(),
  );

  expect(metadata['map3']).toBeDefined();
  expect(metadata['map3'].properties).toBeDefined();
  expect(metadata['map3'].properties.sort()).toEqual(
    [
      { target: 'prop1', source: 'prop1' },
      { target: 'prop2', source: 'prop2' },
      { target: 'prop3', source: 'prop3' },
    ].sort(),
  );
});

test('with passing target type only then normalize it', () => {
  class Target {}

  class Test {
    @MapMethod(Target)
    map: () => void;
  }

  const metadata = Reflect.getMetadata(MAP_METHOD_METADATA, Test);
  expect(metadata).toBeDefined();
  expect(metadata['map']).toBeDefined();
  expect(metadata['map'].targetType).toEqual(Target);
});

test('with passing list of properties only then normalize it', () => {
  class Test {
    @MapMethod(['prop1', ['prop2', 'prop2'], { target: 'prop3', source: 'prop3' }])
    map: () => void;
  }

  const metadata = Reflect.getMetadata(MAP_METHOD_METADATA, Test);
  expect(metadata).toBeDefined();
  expect(metadata['map']).toBeDefined();
  expect(metadata['map'].properties).toBeDefined();
  expect(metadata['map'].properties.sort()).toEqual(
    [
      { target: 'prop1', source: 'prop1' },
      { target: 'prop2', source: 'prop2' },
      { target: 'prop3', source: 'prop3' },
    ].sort(),
  );
});

test('with passing list target and source type then normalize it', () => {
  class Target {}
  class Source {}

  class Test {
    @MapMethod([Target, Source])
    map: () => void;
  }

  const metadata = Reflect.getMetadata(MAP_METHOD_METADATA, Test);
  expect(metadata).toBeDefined();
  expect(metadata['map']).toBeDefined();
  expect(metadata['map'].targetType).toEqual(Target);
  expect(metadata['map'].sourceType).toEqual(Source);
});
