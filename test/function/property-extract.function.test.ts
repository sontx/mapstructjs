import { DEFAULT_PROPERTY_EXTRACT_FN } from '../../src/function/property-extract.function';

test('if valid path then extracts valid prop value', () => {
  const obj = {
    name: 'son',
    age: 20,
  };

  const result = DEFAULT_PROPERTY_EXTRACT_FN(obj, 'name', ['name']);
  expect(result).toEqual('son');
});

test('if valid nested path then extracts valid prop value', () => {
  const obj = {
    name: 'son',
    age: 20,
    address: {
      city: {
        name: 'da nang',
      },
    },
  };

  const result = DEFAULT_PROPERTY_EXTRACT_FN(obj, 'address.city.name', ['address', 'city', 'name']);
  expect(result).toEqual('da nang');
});

test('if prop is not an valid object then return undefined', () => {
  const result2 = DEFAULT_PROPERTY_EXTRACT_FN(null, 'name', ['name']);
  expect(result2).toBeUndefined();

  const result3 = DEFAULT_PROPERTY_EXTRACT_FN(undefined, 'name', ['name']);
  expect(result3).toBeUndefined();

  const result4 = DEFAULT_PROPERTY_EXTRACT_FN(null, 'city.name', ['city', 'name']);
  expect(result4).toBeUndefined();

  const result5 = DEFAULT_PROPERTY_EXTRACT_FN(undefined, 'city.name', ['city', 'name']);
  expect(result5).toBeUndefined();
});

test('if path not match then returns undefined', () => {
  const obj = {
    name: 'son',
    age: 20,
  };

  const result = DEFAULT_PROPERTY_EXTRACT_FN(obj, 'favorite', ['favorite']);
  expect(result).toBeUndefined();
});

test('if nested path not match then returns undefined', () => {
  const obj = {
    name: 'son',
    age: 20,
    address: {
      city: {
        name: 'da nang',
      },
    },
  };

  const result = DEFAULT_PROPERTY_EXTRACT_FN(obj, 'address.city.title', ['address', 'city', 'title']);
  expect(result).toBeUndefined();
});

test('if split path is empty then return prop itself', () => {
  const obj = {
    name: 'son',
    age: 20,
  };

  const result = DEFAULT_PROPERTY_EXTRACT_FN(obj, '', []);
  expect(result).toEqual(obj);
});
