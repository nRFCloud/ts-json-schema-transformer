import Ajv from "ajv";
import * as ts from "typescript";
import { ScriptKind, ScriptTarget } from "typescript";
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
        minify: true,
        bundle: true,
        platform: "node",
        target: "node18",
        format: "esm",
        external: ["ajv"],
      })
    }`.replace(/export{(\S+?) as default};/g, "return $1;");

    const sourceFile = ts.createSourceFile("temp.ts", bundleValidator, ScriptTarget.Latest, false, ScriptKind.JS);

    const bodyExpression = ts.factory.createBlock(sourceFile.statements, true);

    const functionExpression = ts.factory.createArrowFunction(
      undefined,
      undefined,
      [],
      undefined,
      undefined,
      bodyExpression,
    );

    return ts.factory.createCallExpression(
      functionExpression,
      undefined,
      [],
    );
  }
}
