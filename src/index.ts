import type { JSONSchemaType, ValidateFunction } from "ajv";

/**
 * Get the JSON schema for the provided type
 * @transformer ts-json-schema-transformer
 */
export function getSchema<T>(): JSONSchemaType<T> {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * Validate an object according to the provided type
 * Acts as a type guard
 * @transformer ts-json-schema-transformer
 */
export function validate<T>(_obj: unknown): ReturnType<ValidateFunction<T>> {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * Get a validator for the provided type
 * @transformer ts-json-schema-transformer
 */
export function createValidateFn<T>(): ValidateFunction<T> {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * Get a validator for the provided type
 * @deprecated use `createValidateFn`
 * @transformer ts-json-schema-transformer
 */
export function createValidator<T>(): ValidateFunction<T> {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * Get a mock object for the provided type
 * @deprecated use `mock`
 * @transformer ts-json-schema-transformer
 */
export function getMockObject<T, const Seed extends string = "none">(): IfEquals<Seed, string, never, T> {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * Get a mock object for the provided type
 * @transformer ts-json-schema-transformer
 */
export function mock<T, const Seed extends string = "none">(): IfEquals<Seed, string, never, T> {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * @transformer ts-json-schema-transformer
 */
export function createMockFn<T, const S extends string = "none">(): () => IfEquals<T, string, never, T> {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * Assert that an object is valid according to the provided type
 * Acts as a type guard
 * @deprecated use `assertGuard`
 * @transformer ts-json-schema-transformer
 */
export function assertValid<T = never>(_obj: unknown): asserts _obj is T {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * Assert that an object is valid according to the provided type
 * Acts as a type guard
 * @transformer ts-json-schema-transformer
 */
export function assertGuard<T = never>(_obj: unknown): asserts _obj is T {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * Create an assert guard function for the provided type
 * Acts as a type guard
 * @transformer ts-json-schema-transformer
 */
export function createAssertGuardFn<T = never>(): GuardFn<T> {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * Assert that an object is valid and returns the object back
 * @transformer ts-json-schema-transformer
 */
export function assert<T = never>(_obj: unknown): T {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * Create an assert function for the provided type
 * @transformer ts-json-schema-transformer
 */
export function createAssertFn<T = never>(): (_obj: unknown) => T {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * Parse a string into the provided type
 * Returns undefined if the string is not valid
 * @transformer ts-json-schema-transformer
 */
export function parse<T>(_input: string): T | undefined {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * Create a parse function for the provided type
 * Returns undefined if the string is not valid
 * @transformer ts-json-schema-transformer
 */
export function createParseFn<T>(): (input: string) => T | undefined {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * Assert that a string can be parsed into the provided type, then returns it
 * @transformer ts-json-schema-transformer
 */
export function assertParse<T>(_input: string): T {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

/**
 * Create an assert parse function for the provided type
 * @transformer ts-json-schema-transformer
 */
export function createAssertParseFn<T>(): (input: string) => T {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

export type GuardFn<T> = (obj: unknown) => asserts obj is T;

export class ValidationError extends Error {}

/**
 * @internal
 */
export function validationAssertion(validator: ValidateFunction<unknown>, shouldReturn: boolean, obj: unknown) {
  if (!validator(obj)) {
    throw new ValidationError(`Validation error: ${validator.errors?.map(error => JSON.stringify(error)).join(", ")}`, {
      cause: validator.errors,
    });
  }
  return shouldReturn ? obj : undefined;
}

/**
 * @internal
 */
export function parser(validator: ValidateFunction<unknown>, assert: boolean, input: string) {
  const parsed = JSON.parse(input);
  if (assert) {
    return validationAssertion(validator, true, parsed);
  }
  return validator(parsed) ? parsed : undefined;
}

/**
 * @internal
 */
export function noop(arg: unknown) {
  return arg;
}

type Exact<T, U> = IfEquals<T, U, T, never>;
type IfEquals<T, U, Y = unknown, N = never> = (<G>() => G extends T ? 1 : 2) extends (<G>() => G extends U ? 1 : 2) ? Y
  : N;
type NotAny<T> = 0 extends (1 & T) ? never : T;
