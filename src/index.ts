import type { JSONSchemaType, ValidateFunction } from "ajv";

export function getSchema<T>(): JSONSchemaType<T> {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

export function getValidator<T>(): ValidateFunction<T> {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

export function getMockObject<T>(): T {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

export function assertValid<T = never, U extends T = T>(_obj: unknown): asserts _obj is U {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * @internal
 */
export function validationAssertion(validator: ValidateFunction<unknown>, obj: unknown) {
  if (!validator(obj)) {
    throw Error(`Validation error: ${validator.errors?.map(error => JSON.stringify(error)).join(", ")}`);
  }
  return obj;
}
