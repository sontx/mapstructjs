import { DEFAULT_PROPERTY_MAP_FN } from '../../src/function/property-map.function';

test('returns exact what we pass', () => {
  const obj = { name: 'son' };
  const result = DEFAULT_PROPERTY_MAP_FN(obj, null);
  expect(result).toEqual(obj);
});
