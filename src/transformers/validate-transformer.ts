import Ajv from "ajv";
import * as ts from "typescript";
import { IProject } from "../project.js";
import { addFormats, bundleSource, fixAjvImportCode, getGenericArg } from "./utils.js";

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

    // GET TYPE INFO
    const [type, node] = getGenericArg(project, expression);
    if (type.isTypeParameter()) {
      throw new Error(
        `Error on getSchema: non-specified generic argument.`,
      );
    }

    const schema = project.schemaGenerator.createSchemaFromNodes([node]);

    const compiled = ajv.compile(schema);
    const scope = ajv.scope.scopeCode(compiled.source?.scopeValues, {}).toString();
    const validatorBody = fixAjvImportCode(`${scope}\nexport default ${compiled.source?.validateCode}`);
    const bundleValidator = `${
      bundleSource(validatorBody, {
        bundle: true,
        platform: "node",
        target: "node18",
        format: "esm",
        minify: false,
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
 */
function stripRanges(node: ts.Node) {
  (node as { pos: number }).pos = -1;
  (node as { end: number }).end = -1;

  ts.forEachChild(node, stripRanges);
}
