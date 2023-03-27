import type { JSONSchemaType, ValidateFunction } from "ajv";

export function getSchema<T>(): JSONSchemaType<T> {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}

export function getValidator<T>(): ValidateFunction<T> {
  throw new Error("Not implemented. Did you forget to run the transformer?");
}
