import { MAPPING_METADATA } from '../../src/constants';

import 'reflect-metadata';
import { Mapping, MappingConfig } from '../../src/decorator/mapping.decorator';

test('with valid config then inject to target metadata', () => {
  const config1: MappingConfig = {
    target: 'prop1',
    source: 'prop1',
  };

  const config2: MappingConfig = {
    target: 'prop2',
    source: 'prop2',
  };

  const config3: MappingConfig = {
    target: 'prop3',
    source: 'prop3',
  };

  class Test {
    @Mapping(config1)
    @Mapping(config2)
    map1: () => void;

    @Mapping(config3)
    map2: () => void;
  }

  const metadata = Reflect.getMetadata(MAPPING_METADATA, Test);

  expect(metadata).not.toBeNull();
  expect(metadata.map1).toEqual({
    prop1: config1,
    prop2: config2,
  });
  expect(metadata.map2).toEqual({
    prop3: config3,
  });
});

test('without passing source then fill source as target', () => {
  const config1: MappingConfig = {
    target: 'prop1',
  };

  const config2: MappingConfig = {
    target: 'prop2',
  };

  const config3: MappingConfig = {
    target: 'prop3',
  };

  class Test {
    @Mapping(config1)
    @Mapping(config2)
    map1: () => void;

    @Mapping(config3)
    map2: () => void;
  }

  const metadata = Reflect.getMetadata(MAPPING_METADATA, Test);

  expect(metadata).not.toBeNull();
  expect(metadata.map1).toEqual({
    prop1: { ...config1, source: 'prop1' },
    prop2: { ...config2, source: 'prop2' },
  });
  expect(metadata.map2).toEqual({
    prop3: { ...config3, source: 'prop3' },
  });
});
