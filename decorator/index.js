"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Property = exports.Mapper = void 0;
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./after-mapping.decorator"), exports);
tslib_1.__exportStar(require("./before-mapping.decorator"), exports);
tslib_1.__exportStar(require("./inject.decorator"), exports);
tslib_1.__exportStar(require("./map-method.decorator"), exports);
tslib_1.__exportStar(require("./mapping.decorator"), exports);
var mapper_decorator_1 = require("./mapper.decorator");
Object.defineProperty(exports, "Mapper", { enumerable: true, get: function () { return mapper_decorator_1.Mapper; } });
var property_decorator_1 = require("./property.decorator");
Object.defineProperty(exports, "Property", { enumerable: true, get: function () { return property_decorator_1.Property; } });
//# sourceMappingURL=index.js.map