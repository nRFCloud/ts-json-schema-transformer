import { createFormatter, createParser } from "ts-json-schema-generator";
import * as ts from "typescript";
import { AJV_DEFAULTS, AJVOptions, IOptions, IProject, SCHEMA_DEFAULTS, SchemaConfig } from "./project.js";
import { SchemaGenerator } from "./schema-generator.js";
import { FileTransformer } from "./transformers/file-transformer.js";

export default function transform(program: ts.Program, options: IOptions = {}): ts.TransformerFactory<ts.SourceFile> {
  const {
    loopEnum,
    loopRequired,
    encodeRefs,
    strictTuples,
    jsDoc,
    removeAdditional,
    coerceTypes,
    useDefaults,
    allErrors,
    sortProps,
    expose,
  } = options ?? {};

  const schemaConfig: SchemaConfig = {
    ...SCHEMA_DEFAULTS,
    jsDoc: jsDoc || SCHEMA_DEFAULTS.jsDoc,
    strictTuples: strictTuples || SCHEMA_DEFAULTS.strictTuples,
    encodeRefs: encodeRefs || SCHEMA_DEFAULTS.encodeRefs,
    sortProps: sortProps || SCHEMA_DEFAULTS.sortProps,
    expose,
  };

  const validationConfig: AJVOptions = {
    ...AJV_DEFAULTS,
    loopRequired: loopRequired || AJV_DEFAULTS.loopRequired,
    loopEnum: loopEnum || AJV_DEFAULTS.loopEnum,
    removeAdditional: removeAdditional || AJV_DEFAULTS.removeAdditional,
    coerceTypes: coerceTypes || AJV_DEFAULTS.coerceTypes,
    useDefaults: useDefaults || AJV_DEFAULTS.useDefaults,
    allErrors: allErrors || AJV_DEFAULTS.allErrors,
  };

  const schemaGenerator = new SchemaGenerator(program, schemaConfig);
  const project: IProject = {
    checker: program.getTypeChecker(),
    options: {
      schema: schemaConfig,
      validation: validationConfig,
    },
    program,
    nodeParser: createParser(program, schemaConfig),
    schemaGenerator,
    typeFormatter: createFormatter(schemaConfig),
  };

  return (context) => {
    return (file) => {
      return FileTransformer.transform(project, context, file);
    };
  };
}
