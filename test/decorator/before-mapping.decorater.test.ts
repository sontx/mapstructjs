import { BEFORE_MAPPING_METADATA } from '../../src/constants';

import 'reflect-metadata';
import { BeforeMapping, BeforeMappingConfig } from '../../src/decorator/before-mapping.decorater';
import { DEFAULT_CONFIG } from '../../src/decorator/hook-mapping.decorator';

class Source {}
class Target {}

test('with valid config then inject to target metadata', () => {
  const config1: BeforeMappingConfig = {
    sourceType: Source,
    targetType: Target,
  };

  const config2: BeforeMappingConfig = {
    methodName: 'map',
  };

  class Test {
    @BeforeMapping(config1)
    callMe1() {}

    @BeforeMapping(config2)
    callMe2() {}
  }

  const metadata = Reflect.getMetadata(BEFORE_MAPPING_METADATA, Test);

  expect(metadata).not.toBeNull();
  expect(metadata.callMe1).toEqual(config1);
  expect(metadata.callMe2).toEqual(config2);
});

test('without config then inject default metadata to target', () => {
  class Test {
    @BeforeMapping()
    callMe1() {}

    @BeforeMapping()
    callMe2() {}
  }

  const metadata = Reflect.getMetadata(BEFORE_MAPPING_METADATA, Test);

  expect(metadata).not.toBeNull();
  expect(metadata.callMe1).toEqual(DEFAULT_CONFIG);
  expect(metadata.callMe2).toEqual(DEFAULT_CONFIG);
});
