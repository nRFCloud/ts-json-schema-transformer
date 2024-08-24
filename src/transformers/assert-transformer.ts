import { ts as schemaGeneratorTs } from "ts-json-schema-generator";
import * as ts from "typescript";
import { IProject } from "../project.js";
import { schemaToValidator } from "../transformer-utils.js";
import { FileTransformer } from "./file-transformer.js";
import { getGenericArg } from "./utils.js";

export abstract class AssertTransformer {
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

  public static transform(project: IProject, expression: ts.CallExpression, shouldReturn = false): ts.Node {
    const validatorCallExp = this.createValidator(project, expression);
    const validationAssertionIdentifier = FileTransformer.getOrCreateImport(
      expression.getSourceFile(),
      "@nrfcloud/ts-json-schema-transformer",
      "validationAssertion",
    );
    return ts.factory.createCallExpression(validationAssertionIdentifier, undefined, [
      validatorCallExp,
      shouldReturn ? ts.factory.createTrue() : ts.factory.createFalse(),
      expression.arguments[0],
    ]);
  }

  public static transformWithReturn(project: IProject, expression: ts.CallExpression): ts.Node {
    return this.transform(project, expression, true);
  }

  public static transformCreateFn(
    project: IProject,
    expression: ts.CallExpression,
    shouldReturn = false,
  ): ts.Node {
    const validatorCallExp = this.createValidator(project, expression);
    const validationAssertionIdentifier = FileTransformer.getOrCreateImport(
      expression.getSourceFile(),
      "@nrfcloud/ts-json-schema-transformer",
      "validationAssertion",
    );
    return ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        validationAssertionIdentifier,
        "bind",
      ),
      undefined,
      [
        validationAssertionIdentifier,
        validatorCallExp,
        shouldReturn ? ts.factory.createTrue() : ts.factory.createFalse(),
      ],
    );
  }

  public static transformCreateFnWithReturn(project: IProject, expression: ts.CallExpression): ts.Node {
    return this.transformCreateFn(project, expression, true);
  }
}
