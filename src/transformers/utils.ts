import $RefParser from "@apidevtools/json-schema-ref-parser";
import _dereference from "@apidevtools/json-schema-ref-parser/dist/lib/dereference.js";
import Ajv, { _ } from "ajv";
import { BuildOptions, buildSync } from "esbuild";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { JSONSchema7 } from "json-schema";
import { join } from "path";
import ts from "typescript";
import {
  binary,
  BYTE,
  byte,
  date,
  date_time,
  double,
  duration,
  email,
  float,
  hostname,
  int32,
  int64,
  ipv4,
  ipv6,
  iso_date_time,
  iso_time,
  json_pointer,
  json_pointer_uri_fragment,
  password,
  regex,
  relative_json_pointer,
  time,
  uri,
  uri_reference,
  uri_template,
  uuid,
} from "../formats";
import { IProject } from "../project.js";

const { JSONSchemaFaker: jsf } = require("json-schema-faker");

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
  const dir = join(__dirname, "..", "..", ".tmp");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function bundleSource(source: string, options: BuildOptions): string {
  const dir = getTmpDir();
  const tempFilePath = join(dir, "temp.js");
  const outfile = join(dir, "temp.bundled.js");
  writeFileSync(tempFilePath, source);
  buildSync({
    ...options,
    entryPoints: [tempFilePath],
    outfile,
  });
  return readFileSync(outfile, "utf-8");
}

export function fixAjvImportCode(code: string): string {
  const regex = /const ([a-zA-Z\d_]+?) = require\("([\S]+?)"\)\.([a-zA-Z_]+?)[;|$]/;
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

export function addFormatsAjv(ajv: Ajv) {
  ajv.opts.code.formats = _`require(${__dirname + "/../generated/formats.mjs"})`;
  ajv.addFormat("uuid", uuid);
  ajv.addFormat("json_pointer", json_pointer);
  ajv.addFormat("json_pointer_uri_fragment", json_pointer_uri_fragment);
  ajv.addFormat("relative_json_pointer", relative_json_pointer);
  ajv.addFormat("byte", byte);
  ajv.addFormat("int32", int32);
  ajv.addFormat("int64", int64);
  ajv.addFormat("float", float);
  ajv.addFormat("double", double);
  ajv.addFormat("password", password);
  ajv.addFormat("binary", binary);
  ajv.addFormat("regex", regex);
  ajv.addFormat("date_time", date_time);
  ajv.addFormat("date", date);
  ajv.addFormat("time", time);
  ajv.addFormat("email", email);
  ajv.addFormat("hostname", hostname);
  ajv.addFormat("ipv4", ipv4);
  ajv.addFormat("ipv6", ipv6);
  ajv.addFormat("uri", uri);
  ajv.addFormat("uri_reference", uri_reference);
  ajv.addFormat("uri_template", uri_template);
  ajv.addFormat("duration", duration);
  ajv.addFormat("iso_time", iso_time);
  ajv.addFormat("iso_date_time", iso_date_time);
}

export function addFormatsJsf() {
  jsf.format("relative-json-pointer", () => {
    const test = jsf.random.randexp(relative_json_pointer.source).toString();
    console.log(test);
    return test;
  });
  jsf.format("byte", () => jsf.random.randexp(BYTE.source).toString());
  jsf.format("password", () => jsf.random.randexp("\S{8,20}").toString());
  jsf.format("binary", () => jsf.random.randexp("\S{8,20}").toString());
  jsf.format("iso-time", () => jsf.random.randexp(iso_time.validate.source).toString());
  jsf.format("iso-date-time", () => jsf.random.randexp(iso_date_time.validate.source).toString());
}

/**
 * takes a json object and recursively converts it to an object literal expression
 */
export function convertObjectToLiteralExpression(
  object: Record<string, unknown>,
): ts.Expression {
  const properties: ts.ObjectLiteralElementLike[] = [];
  for (const [key, value] of Object.entries(object)) {
    properties.push(
      ts.factory.createPropertyAssignment(
        ts.factory.createStringLiteral(key),
        convertValueToExpression(value),
      ),
    );
  }
  return ts.factory.createObjectLiteralExpression(properties);
}

export function convertValueToExpression(value: unknown): ts.Expression {
  if (typeof value === "string") {
    return ts.factory.createStringLiteral(value);
  } else if (typeof value === "number") {
    return ts.factory.createNumericLiteral(value);
  } else if (typeof value === "boolean") {
    if (value) {
      return ts.factory.createTrue();
    } else {
      return ts.factory.createFalse();
    }
  } else if (typeof value === "object") {
    if (Array.isArray(value)) {
      return ts.factory.createArrayLiteralExpression(
        value.map(convertValueToExpression),
      );
    }
    return convertObjectToLiteralExpression(value as Record<string, unknown>);
  } else if (value === null) {
    return ts.factory.createNull();
  } else if (value === undefined) {
    return ts.factory.createIdentifier("undefined");
  } else {
    throw new Error(`Unknown type ${typeof value}`);
  }
}

/**
 * Inlines the root $ref in a json schema
 */
export function derefJSONSchemaRoot(schema: JSONSchema7) {
  const deepCopy = JSON.parse(JSON.stringify(schema));

  const { "$ref": rootRef, ...baseSchema } = deepCopy;
  const wrappedSchema: JSONSchema7 = {
    ...baseSchema,
    properties: {
      temp: {
        $ref: rootRef,
      },
    },
  };

  dereference(wrappedSchema);
  const derefedSchema = wrappedSchema.properties?.temp as JSONSchema7;
  delete wrappedSchema.properties;
  return {
    ...wrappedSchema,
    ...derefedSchema,
  };
}

export const dereference = (schema: JSONSchema7) => {
  const parser = new $RefParser();
  parser.parse(schema);
  parser.schema = schema;
  _dereference(parser, { dereference: { circular: true } }); // NOTE: mutates schema
  return schema;
};
