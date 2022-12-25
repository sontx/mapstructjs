import { MAPPER_METADATA } from '../../src/constants';

import 'reflect-metadata';
import { DEFAULT_CONFIG, Mapper, MapperConfig } from '../../src/decorator/mapper.decorator';

test('with valid config then inject to target metadata', () => {
  class Another {}

  const config: MapperConfig = {
    uses: [Another],
  };

  @Mapper(config)
  class Test {}

  const metadata = Reflect.getMetadata(MAPPER_METADATA, Test);

  expect(metadata).not.toBeNull();
  expect(metadata).toEqual(config);
});

test('without config then inject an empty config to target metadata', () => {
  @Mapper()
  class Test {}

  const metadata = Reflect.getMetadata(MAPPER_METADATA, Test);

  expect(metadata).not.toBeNull();
  expect(metadata).toEqual(DEFAULT_CONFIG);
});
