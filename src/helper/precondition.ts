export function mustBeDefined(prop: any, message?: string) {
  if (!prop) {
    throw new TypeError(message);
  }
}
