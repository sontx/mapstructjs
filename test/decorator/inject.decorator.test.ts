import { INJECT_METADATA } from '../../src/constants';

import 'reflect-metadata';
import { Inject, InjectConfig } from '../../src/decorator/inject.decorator';

class Injectable1 {}
class Injectable2 {}

test('with valid config then inject to target metadata', () => {
  const config1: InjectConfig = {
    type: Injectable1,
  };

  const config2: InjectConfig = {
    type: Injectable2,
  };

  class Test {
    @Inject(config1)
    prop1: Injectable1;

    @Inject(config2)
    prop2: Injectable2;
  }

  const metadata = Reflect.getMetadata(INJECT_METADATA, Test);

  expect(metadata).not.toBeNull();
  expect(metadata.prop1).toEqual(config1);
  expect(metadata.prop2).toEqual(config2);
});
