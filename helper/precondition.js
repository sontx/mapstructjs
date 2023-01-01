"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mustBeDefined = void 0;
function mustBeDefined(prop, message) {
    if (!prop) {
        throw new TypeError(message);
    }
}
exports.mustBeDefined = mustBeDefined;
//# sourceMappingURL=precondition.js.map