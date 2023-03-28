import { buildSync } from "esbuild";
import { join } from "path";
import { createFormatter, createParser, DEFAULT_CONFIG, SchemaGenerator } from "ts-json-schema-generator";
import * as ts from "typescript";
import { AJV_DEFAULTS, AJVOptions, IOptions, IProject, SchemaConfig } from "./project.js";
import { FileTransformer } from "./transformers/file-transformer.js";
import { getTmpDir } from "./transformers/utils.js";

const formatsPath = buildFormats();
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
  } = options ?? {};

  const schemaConfig: SchemaConfig = {
    ...DEFAULT_CONFIG,
    jsDoc: jsDoc || DEFAULT_CONFIG.jsDoc,
    strictTuples: strictTuples || DEFAULT_CONFIG.strictTuples,
    encodeRefs: encodeRefs || DEFAULT_CONFIG.encodeRefs,
    additionalProperties: additionalProperties || true,
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

  const nodeParser = createParser(program, schemaConfig);
  const typeFormatter = createFormatter(schemaConfig);

  const schemaGenerator = new SchemaGenerator(program, nodeParser, typeFormatter, schemaConfig);
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
    formatsPath,
  };

  return (context) => {
    return (file) => {
      return FileTransformer.transform(project, context, file);
    };
  };
}

export function buildFormats() {
  const dir = getTmpDir();
  const outfile = join(dir, "formats.js");
  buildSync({
    format: "esm",
    minify: true,
    target: "node18",
    entryPoints: [require.resolve("./formats.mjs")],
    bundle: true,
    outfile,
    external: ["ajv"],
  });
  return outfile;
}
