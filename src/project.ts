import type { Options } from "ajv";
import { Config, NodeParser, SchemaGenerator, TypeFormatter } from "ts-json-schema-generator";
import * as ts from "typescript";

export interface IProject {
  program: ts.Program;
  options: {
    schema: SchemaConfig;
    validation: AJVOptions;
  };
  checker: ts.TypeChecker;
  schemaGenerator: SchemaGenerator;
  typeFormatter: TypeFormatter;
  nodeParser: NodeParser;
}

export type AJVOptions = Pick<
  Options,
  "useDefaults" | "coerceTypes" | "removeAdditional" | "loopRequired" | "loopEnum" | "allErrors"
>;
export type SchemaConfig = Pick<
  Config,
  "sortProps" | "expose" | "jsDoc" | "strictTuples" | "encodeRefs" | "additionalProperties"
>;

export const AJV_DEFAULTS = {
  useDefaults: true,
  coerceTypes: false,
  loopRequired: 20,
  allErrors: true,
  removeAdditional: false,
} as const satisfies Options;

export const SCHEMA_DEFAULTS = {
  expose: "export",
  jsDoc: "extended",
  sortProps: true,
  strictTuples: false,
  encodeRefs: true,
  additionalProperties: false,
  minify: true,
  topRef: true,
  markdownDescription: true,
  extraTags: [],
  skipTypeCheck: true,
  discriminatorType: "json-schema",
  functions: "fail",
} as const satisfies Config;

export type IOptions = AJVOptions & SchemaConfig;
