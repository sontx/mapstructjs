import { DEFAULT_SERVICE_OPTIONS, ServiceOptions } from './service-options';

export abstract class ServiceConfigurable {
  constructor(protected readonly options?: ServiceOptions) {
    this.options = {
      ...DEFAULT_SERVICE_OPTIONS,
      ...(options ?? {}),
    };

    this.onInit(this.options);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onInit(options: ServiceOptions) {}
}
