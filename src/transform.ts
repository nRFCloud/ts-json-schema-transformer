import {
  createFormatter,
  createParser,
  DEFAULT_CONFIG as TsJsonSchemaGeneratorDefaultConfig,
  SchemaGenerator,
  ts as schemaGeneratorTs,
} from "ts-json-schema-generator";
import * as ts from "typescript";
import { AJV_DEFAULTS, IOptions, IProject, SCHEMA_DEFAULTS } from "./project.js";
import { FileTransformer } from "./transformers/file-transformer.js";

export default function transform(program: ts.Program, options: IOptions = {}): ts.TransformerFactory<ts.SourceFile> {
  const {
    loopEnum,
    loopRequired,
    additionalProperties,
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

  const schemaConfig = {
    ...TsJsonSchemaGeneratorDefaultConfig,
    ...SCHEMA_DEFAULTS,
    jsDoc: jsDoc || SCHEMA_DEFAULTS.jsDoc,
    strictTuples: strictTuples || SCHEMA_DEFAULTS.strictTuples,
    encodeRefs: encodeRefs || SCHEMA_DEFAULTS.encodeRefs,
    additionalProperties: additionalProperties || SCHEMA_DEFAULTS.additionalProperties,
    sortProps: sortProps || SCHEMA_DEFAULTS.sortProps,
    expose: expose || SCHEMA_DEFAULTS.expose,
  };

  const validationConfig = {
    ...AJV_DEFAULTS,
    loopRequired: loopRequired || AJV_DEFAULTS.loopRequired,
    loopEnum,
    removeAdditional: removeAdditional || AJV_DEFAULTS.removeAdditional,
    coerceTypes: coerceTypes || AJV_DEFAULTS.coerceTypes,
    useDefaults: useDefaults || AJV_DEFAULTS.useDefaults,
    allErrors: allErrors || AJV_DEFAULTS.allErrors,
  };

  const nodeParser = createParser(program as schemaGeneratorTs.Program, {
    ...schemaConfig,
  });
  const typeFormatter = createFormatter({
    ...schemaConfig,
  });

  const schemaGenerator = new SchemaGenerator(
    program as schemaGeneratorTs.Program,
    nodeParser,
    typeFormatter,
    schemaConfig,
  );
  const project: IProject = {
    checker: program.getTypeChecker(),
    options: {
      schema: schemaConfig,
      validation: validationConfig,
    },
    program,
    nodeParser: createParser(program as schemaGeneratorTs.Program, schemaConfig),
    schemaGenerator,
    typeFormatter: createFormatter(schemaConfig),
  };

  return (context) => {
    return (file) => {
      return FileTransformer.transform(project, context, file);
    };
  };
}
