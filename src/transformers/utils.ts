import ts from "typescript";
import {IProject} from "../project.js";
import {join} from "path";
import {BuildOptions, buildSync} from 'esbuild'
import {mkdirSync, existsSync, writeFileSync, readFileSync, copyFileSync} from "fs";
import Ajv, {_} from "ajv";
import {
    binary,
    byte, date, date_time, double, duration, email,
    float, hostname,
    int32,
    int64, ipv4, ipv6,
    json_pointer,
    json_pointer_uri_fragment, password, regex,
    relative_json_pointer, time, uri, uri_reference, uri_template,
    uuid
} from "../formats";

export function getGenericArg(project: IProject, expression: ts.CallExpression): [ts.Type, ts.Node, boolean] {
    return expression.typeArguments && expression.typeArguments[0]
        ? [
            project.checker.getTypeFromTypeNode(
                expression.typeArguments[0],
            ),
            expression.typeArguments[0],
            true,
        ]
        : [
            project.checker.getTypeAtLocation(
                expression.arguments[0]!,
            ),
            expression.arguments[0]!,
            false,
        ];

}

export function getTmpDir() {
    const dir =  join(__dirname, '..', '..', '.tmp');
    if (!existsSync(dir)) {
        mkdirSync(dir, {recursive: true});
    }
    return dir;
}
export function bundleSource(source: string, options: BuildOptions): string {
    const dir = getTmpDir();
    const tempFilePath = join(dir, 'temp.js');
    const outfile = join(dir, 'temp.bundled.js');
    writeFileSync(tempFilePath, source);
    buildSync({
        ...options,
        entryPoints: [tempFilePath],
        outfile,
    });
    return readFileSync(outfile, 'utf-8');
}

export function fixAjvImportCode(code: string): string {
    const regex = /const ([a-zA-Z\d_]+?) = require\("([\S]+?)"\)\.([a-zA-Z_]+?)[;|$]/;
    // return code.replace(regex, '\nimport {$3 as $1} from "$2";');
    let input = code.toString();
    let match: RegExpMatchArray | null = null;
    while (match = input.match(regex)) {
        const [, variable, module, value] = match;
        const replacement = `import {${value} as ${variable}} from "${module}";\n`;
        const frontEnd = match.index;
        const backStart = (match.index || 0) + match[0].length;
        const front = input.substring(0, frontEnd);
        const back = input.substring(backStart);
        input = replacement + front + back;
    }
    return input;
}

export function addFormats(ajv: Ajv) {
    ajv.opts.code.formats = _`require(${__dirname + '/../formats.mjs'})`
    ajv.addFormat("uuid", uuid)
    ajv.addFormat("json_pointer", json_pointer)
    ajv.addFormat("json_pointer_uri_fragment", json_pointer_uri_fragment)
    ajv.addFormat("relative_json_pointer", relative_json_pointer)
    ajv.addFormat("byte", byte)
    ajv.addFormat("int32", int32)
    ajv.addFormat("int64", int64)
    ajv.addFormat("float", float)
    ajv.addFormat("double", double)
    ajv.addFormat("password", password)
    ajv.addFormat("binary", binary)
    ajv.addFormat("regex", regex)
    ajv.addFormat("date_time", date_time)
    ajv.addFormat("date", date)
    ajv.addFormat("time", time)
    ajv.addFormat("email", email)
    ajv.addFormat("hostname", hostname)
    ajv.addFormat("ipv4", ipv4)
    ajv.addFormat("ipv6", ipv6)
    ajv.addFormat("uri", uri)
    ajv.addFormat("uri_reference", uri_reference)
    ajv.addFormat("uri_template", uri_template)
    ajv.addFormat("duration", duration)
}
