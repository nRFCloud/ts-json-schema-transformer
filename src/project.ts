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

export const AJV_DEFAULTS: AJVOptions = {
  useDefaults: true,
  coerceTypes: false,
  loopRequired: 20,
  allErrors: true,
  removeAdditional: false,
};

export const SCHEMA_DEFAULTS: SchemaConfig = {
  expose: "export",
  jsDoc: "extended",
  sortProps: true,
  strictTuples: false,
  encodeRefs: true,
  additionalProperties: false,
};

export type IOptions = AJVOptions & SchemaConfig;
