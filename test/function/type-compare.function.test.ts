import { DEFAULT_TYPE_COMPARE_FN } from '../../src/function/type-compare.function';

test('same types are equal', () => {
  class Test {}
  const result = DEFAULT_TYPE_COMPARE_FN(Test, Test);
  expect(result).toBeTruthy();
});

test('if type1 inherit from type2 then return true', () => {
  class Test1 {}
  class Test2 extends Test1 {}
  const result = DEFAULT_TYPE_COMPARE_FN(Test2, Test1);
  expect(result).toBeTruthy();
});

test('if type2 inherit from type1 then return false', () => {
  class Test1 {}
  class Test2 extends Test1 {}
  const result = DEFAULT_TYPE_COMPARE_FN(Test1, Test2);
  expect(result).toBeFalsy();
});

test('if type1 and type2 are different then return false', () => {
  class Test1 {}
  class Test2 {}
  const result = DEFAULT_TYPE_COMPARE_FN(Test1, Test2);
  expect(result).toBeFalsy();
});
