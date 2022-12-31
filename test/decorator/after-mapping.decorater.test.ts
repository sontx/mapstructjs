import { AfterMapping, AfterMappingConfig } from '../../src/decorator/after-mapping.decorator';
import { AFTER_MAPPING_METADATA } from '../../src/constants';

import 'reflect-metadata';
import { DEFAULT_CONFIG } from '../../src/decorator/hook-mapping.decorator';

class Source {}
class Target {}

test('with valid config then inject to target metadata', () => {
  const config1: AfterMappingConfig = {
    sourceType: Source,
    targetType: Target,
  };

  const config2: AfterMappingConfig = {
    methodName: 'map',
  };

  class Test {
    @AfterMapping(config1)
    callMe1() {}

    @AfterMapping(config2)
    callMe2() {}
  }

  const metadata = Reflect.getMetadata(AFTER_MAPPING_METADATA, Test);

  expect(metadata).not.toBeNull();
  expect(metadata.callMe1).toEqual(config1);
  expect(metadata.callMe2).toEqual(config2);
});

test('without config then inject default metadata to target', () => {
  class Test {
    @AfterMapping()
    callMe1() {}

    @AfterMapping()
    callMe2() {}
  }

  const metadata = Reflect.getMetadata(AFTER_MAPPING_METADATA, Test);

  expect(metadata).not.toBeNull();
  expect(metadata.callMe1).toEqual(DEFAULT_CONFIG);
  expect(metadata.callMe2).toEqual(DEFAULT_CONFIG);
});
