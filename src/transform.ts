import * as ts from "typescript";
import {IOptions, IProject} from "./project.js";
import {
    DEFAULT_CONFIG,
    createParser,
    createFormatter,
    createGenerator,
    SchemaGenerator
} from "ts-json-schema-generator";
import {FileTransformer} from "./transformers/file-transformer.js";
import {buildSync} from 'esbuild'
import {getTmpDir} from "./transformers/utils.js";
import {join} from "path";

const formatsPath = buildFormats();
export default function transform(program: ts.Program, options?: IOptions): ts.TransformerFactory<ts.SourceFile> {
    const config = options || DEFAULT_CONFIG;
    const nodeParser = createParser(program, config)
    const typeFormatter = createFormatter(config)

    const schemaGenerator = new SchemaGenerator(program, nodeParser, typeFormatter, config);
    const project: IProject = {
        checker: program.getTypeChecker(),
        config: config,
        program,
        nodeParser: createParser(program, config),
        schemaGenerator,
        typeFormatter: createFormatter(config),
        formatsPath,
    }

    return (context) => {
        return (file) => {
            return FileTransformer.transform(project, context, file);
        };
    };
}

export function buildFormats() {
    const dir = getTmpDir();
    const outfile = join(dir, 'formats.js');
    console.log(outfile);
    buildSync({
        format: 'esm',
        minify: true,
        target: 'node18',
        entryPoints: [require.resolve("./formats.js")],
        bundle: true,
        outfile,
        external: ['ajv'],
    })
    return outfile;
}
