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
  formatsPath: string;
}

export type AJVOptions = Pick<
  Options,
  "useDefaults" | "coerceTypes" | "removeAdditional" | "loopRequired" | "loopEnum"
>;
export type SchemaConfig = Pick<Config, "jsDoc" | "strictTuples" | "encodeRefs" | "additionalProperties">;

export const AJV_DEFAULTS: AJVOptions = {
  useDefaults: false,
  coerceTypes: true,
  loopRequired: 20,
};

export type IOptions = AJVOptions & SchemaConfig;
