import { DEFAULT_TARGET_FACTORY_FN } from '../../src/function/target-factory.function';
import { MappingContext } from '../../src/mapping-context';

test('if valid arguments then return an new instance of passing type', () => {
  class Test {}
  const context: MappingContext = {
    arguments: [],
  } as any;

  const result = DEFAULT_TARGET_FACTORY_FN(Test, context);
  expect(result).toBeInstanceOf(Test);
});

test('passing arguments are passed into new instance constructor', () => {
  class Test {
    constructor(public arg1, public arg2) {}
  }
  const context: MappingContext = {
    arguments: [1, 2],
  } as any;

  const result = DEFAULT_TARGET_FACTORY_FN(Test, context);
  expect(result).toBeInstanceOf(Test);
  expect(result.arg1).toEqual(1);
  expect(result.arg2).toEqual(2);
});

test('if target is not defined then create a new anonymous object', () => {
  const result = DEFAULT_TARGET_FACTORY_FN(null, {} as any);
  expect(result).toStrictEqual({});
});
