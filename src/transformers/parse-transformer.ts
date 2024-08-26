import { ts as schemaGeneratorTs } from "ts-json-schema-generator";
import * as ts from "typescript";
import { IProject } from "../project";
import { schemaToValidator } from "../transformer-utils";
import { FileTransformer } from "./file-transformer";
import { getGenericArg } from "./utils";

export abstract class ParseTransformer {
  private static createValidator(project: IProject, expression: ts.CallExpression): ts.Expression {
    // Get the type info
    const [type, node] = getGenericArg(project, expression);

    if (type.isTypeParameter()) {
      throw new Error(
        `Error on getSchema: non-specified generic argument.`,
      );
    }
    const schema = project.schemaGenerator.createSchemaFromNodes([node as schemaGeneratorTs.Node]);
    return schemaToValidator(schema, project.options.validation);
  }

  public static transform(project: IProject, expression: ts.CallExpression, shouldAssert = false): ts.Node {
    const validatorCallExp = this.createValidator(project, expression);
    const parserIdentifier = FileTransformer.getOrCreateImport(
      expression.getSourceFile(),
      "@nrfcloud/ts-json-schema-transformer",
      "__parser",
    );

    return ts.factory.createCallExpression(parserIdentifier, undefined, [
      validatorCallExp,
      shouldAssert ? ts.factory.createTrue() : ts.factory.createFalse(),
      expression.arguments[0],
    ]);
  }

  public static transformWithAssert(project: IProject, expression: ts.CallExpression): ts.Node {
    return this.transform(project, expression, true);
  }

  public static transformCreateFn(project: IProject, expression: ts.CallExpression, shouldAssert = false): ts.Node {
    const validatorCallExp = this.createValidator(project, expression);
    const parserIdentifier = FileTransformer.getOrCreateImport(
      expression.getSourceFile(),
      "@nrfcloud/ts-json-schema-transformer",
      "__parser",
    );

    return ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        parserIdentifier,
        "bind",
      ),
      undefined,
      [
        parserIdentifier,
        validatorCallExp,
        shouldAssert ? ts.factory.createTrue() : ts.factory.createFalse(),
      ],
    );
  }

  public static transformCreateFnWithAssert(project: IProject, expression: ts.CallExpression): ts.Node {
    return this.transformCreateFn(project, expression, true);
  }
}
