import Ajv from "ajv";
import standaloneCode from "ajv/dist/standalone";
import * as ts from "typescript";
import { IProject } from "../project.js";
import { addFormats, bundleSource, fixAjvImportCode, getGenericArg } from "./utils.js";

/**
 * This is where most of the magic happens.
 * We introspect a schema from the type then generate a validator from it.
 */
export abstract class ValidateTransformer {
  public static transform(project: IProject, expression: ts.CallExpression): ts.Node {
    const ajv = new Ajv({
      ...project.options.validation,
      code: {
        esm: true,
        source: true,
        optimize: true,
        lines: true,
      },
    });
    addFormats(ajv);

    // Get the type info
    const [type, node] = getGenericArg(project, expression);
    if (type.isTypeParameter()) {
      throw new Error(
        `Error on getSchema: non-specified generic argument.`,
      );
    }

    const schema = project.schemaGenerator.createSchemaFromNodes([node]);

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
        external: ["ajv"],
      })
    }`;

    const wrappedValidator = bundleValidator.replace(/export\s*?{\s*?(\S+?) as default\s*?};/g, "return $1;");
    const sourceFile = ts.createSourceFile("temp.js", wrappedValidator, ts.ScriptTarget.ES5, true);

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

    // We must strip the ranges since these nodes from a source file that doesn't exist.
    // This is the only way to fix this for both ESM and CommonJS.
    stripRanges(call);
    return call;
  }
}

/**
 * Strip all ranges from a node and its children.
 * This is a nasty hack to get around the fact that we're creating nodes from a source file that doesn't exist.
 */
function stripRanges(node: ts.Node) {
  (node as { pos: number }).pos = -1;
  (node as { end: number }).end = -1;

  ts.forEachChild(node, stripRanges);
}
