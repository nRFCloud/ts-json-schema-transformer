import type { JSONSchemaType, ValidateFunction } from "ajv";
export declare function getSchema<T>(): JSONSchemaType<T>;
export declare function getValidator<T>(): ValidateFunction<T>;
