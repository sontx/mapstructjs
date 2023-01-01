import { ServiceOptions } from './service-options';
export declare abstract class ServiceConfigurable {
    protected readonly options?: ServiceOptions;
    constructor(options?: ServiceOptions);
    protected onInit(options: ServiceOptions): void;
}
