"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptyObject = exports.isSubclassOf = void 0;
function isSubclassOf(childType, parentType) {
    return childType.prototype instanceof parentType;
}
exports.isSubclassOf = isSubclassOf;
function isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
}
exports.isEmptyObject = isEmptyObject;
//# sourceMappingURL=utils.js.map