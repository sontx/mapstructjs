import { Class } from './types';

export function isSubclassOf(childType: Class, parentType: Class) {
  return childType.prototype instanceof parentType;
}

export function isEmptyObject(obj: object) {
  return Object.keys(obj).length === 0;
}
