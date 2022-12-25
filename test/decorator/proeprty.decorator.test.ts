import { PROPERTY_METADATA } from '../../src/constants';

import 'reflect-metadata';
import { DEFAULT_CONFIG, Property, PropertyConfig } from '../../src/decorator/property.decorator';

test('with valid config then inject to target metadata', () => {
  class Prop1 {}
  class Prop2 {}

  const config1: PropertyConfig = {
    type: Prop1,
  };

  const config2: PropertyConfig = {
    type: Prop2,
  };

  class Test {
    @Property(config1)
    prop1: Prop1;

    @Property(config2)
    prop2: Prop2;
  }

  const metadata = Reflect.getMetadata(PROPERTY_METADATA, Test);

  expect(metadata).not.toBeNull();
  expect(metadata.prop1).toEqual(config1);
  expect(metadata.prop2).toEqual(config2);
});

test('without config then inject default config to metadata', () => {
  class Test {
    @Property()
    prop1: string;

    @Property()
    prop2: number;
  }

  const metadata = Reflect.getMetadata(PROPERTY_METADATA, Test);

  expect(metadata).not.toBeNull();
  expect(metadata.prop1).toEqual(DEFAULT_CONFIG);
  expect(metadata.prop2).toEqual(DEFAULT_CONFIG);
});
