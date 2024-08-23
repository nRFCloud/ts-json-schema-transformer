import type { JSONSchemaType, ValidateFunction } from "ajv";

/**
 * Get the JSON schema for the provided type
 * @transformer ts-json-schema-transformer
 */
export function getSchema<T>(): JSONSchemaType<T> {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * Get a validator for the provided type
 * @transformer ts-json-schema-transformer
 */
export function getValidator<T>(): ValidateFunction<T> {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * Get a mock object for the provided type
 * @transformer ts-json-schema-transformer
 */
export function getMockObject<T, const S extends string = "none">(): IfEquals<S, string, never, T> {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * Assert that an object is valid according to the provided type
 * @transformer ts-json-schema-transformer
 */
export function assertValid<T = never, U extends T = T>(_obj: unknown): asserts _obj is U {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * Assert that an object is valid and returns the object back
 * @transformer ts-json-schema-transformer
 */
export function assert<T = never, U extends T = T>(_obj: unknown): U {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

export class ValidationError extends Error {
}

/**
 * @internal
 */
export function validationAssertion(validator: ValidateFunction<unknown>, obj: unknown) {
  if (!validator(obj)) {
    throw new ValidationError(`Validation error: ${validator.errors?.map(error => JSON.stringify(error)).join(", ")}`, {
      cause: validator.errors,
    });
  }
  return obj;
}

type Exact<T, U> = IfEquals<T, U, T, never>;
type IfEquals<T, U, Y = unknown, N = never> = (<G>() => G extends T ? 1 : 2) extends (<G>() => G extends U ? 1 : 2) ? Y
  : N;
type NotAny<T> = 0 extends (1 & T) ? never : T;
