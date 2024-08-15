import Ajv from "ajv";
import standaloneCode from "ajv/dist/standalone";
import { randomUUID } from "crypto";
import { JSONSchema7 } from "json-schema";
import * as ts from "typescript";
import { convertNamedFormats } from "./formats";
import { AJVOptions } from "./project";
import { addFormatsAjv, bundleSource, fixAjvImportCode } from "./transformers/utils";

export function schemaToValidator(schema: JSONSchema7, options?: AJVOptions) {
  const ajv = new Ajv({
    ...options,
    code: {
      esm: true,
      source: true,
      optimize: true,
      lines: true,
    },
    strictTypes: false,
    strict: false,
  });
  addFormatsAjv(ajv);

  convertNamedFormats(schema);

  const compiled = ajv.compile(schema);

  // Provide scoped values to the validator function.
  // This includes referenced schemas and validators.
  // Additionally, replace the generated validator export with a default export;
  const scoped = standaloneCode(ajv, compiled).replace(/export const validate = \S+?;/g, "");

  const validatorBody = fixAjvImportCode(scoped);
  const bundleValidator = `${
    bundleSource(validatorBody, {
      bundle: true,
      platform: "node",
      target: "node18",
      format: "esm",
      minify: true,
    })
  }`;

  const wrappedValidator = bundleValidator.replace(/export\s*?{\s*?(\S+?) as default\s*?};/g, "return $1;");
  const sourceFile = ts.createSourceFile(randomUUID(), wrappedValidator, ts.ScriptTarget.ES5, true);

  markSynthesized(sourceFile);

  const bodyExpression = ts.factory.createBlock(
    sourceFile.statements,
    false,
  );

  const functionExpression = ts.factory.createArrowFunction(
    undefined,
    undefined,
    [],
    undefined,
    undefined,
    bodyExpression,
  );

  const call = ts.factory.createCallExpression(
    functionExpression,
    undefined,
    [],
  );
  return call;
}

/**
 * Strip all ranges from a node and its children as well as marking them as synthesized.
 */
function markSynthesized(node: ts.Node) {
  (node as { pos: number }).pos = -1;
  (node as { end: number }).end = -1;
  (node as { flags: number }).flags = node.flags | ts.NodeFlags.Synthesized;

  ts.forEachChild(node, markSynthesized);
}
