"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceConfigurable = void 0;
const service_options_1 = require("./service-options");
class ServiceConfigurable {
    constructor(options) {
        this.options = options;
        this.options = Object.assign(Object.assign({}, service_options_1.DEFAULT_SERVICE_OPTIONS), (options !== null && options !== void 0 ? options : {}));
        this.onInit(this.options);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onInit(options) { }
}
exports.ServiceConfigurable = ServiceConfigurable;
//# sourceMappingURL=service-configurable.js.map