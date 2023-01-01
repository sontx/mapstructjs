"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TYPE_COMPARE_FN = void 0;
const utils_1 = require("../helper/utils");
/**
 * Default implementation for {@see TypeCompareFn} that supports for comparing subclasses.
 */
const DEFAULT_TYPE_COMPARE_FN = (type1, type2) => type1 === type2 || (0, utils_1.isSubclassOf)(type1, type2);
exports.DEFAULT_TYPE_COMPARE_FN = DEFAULT_TYPE_COMPARE_FN;
//# sourceMappingURL=type-compare.function.js.map