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
  } = options ?? {};

  const schemaConfig: SchemaConfig = {
    ...DEFAULT_CONFIG,
    jsDoc,
    strictTuples,
    encodeRefs,
    additionalProperties,
  };

  const validationConfig: AJVOptions = {
    ...AJV_DEFAULTS,
    loopRequired,
    loopEnum,
    removeAdditional,
    coerceTypes,
    useDefaults,
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
  console.log(outfile);
  buildSync({
    format: "esm",
    minify: true,
    target: "node18",
    entryPoints: [require.resolve("./formats.js")],
    bundle: true,
    outfile,
    external: ["ajv"],
  });
  return outfile;
}
