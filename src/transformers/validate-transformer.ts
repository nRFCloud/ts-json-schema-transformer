import { ts as schemaGeneratorTs } from "ts-json-schema-generator";
import * as ts from "typescript";
import { IProject } from "../project.js";
import { schemaToValidator } from "../transformer-utils.js";
import { FileTransformer } from "./file-transformer.js";
import { getGenericArg } from "./utils.js";

export abstract class ValidateTransformer {
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

  public static transform(project: IProject, expression: ts.CallExpression): ts.Node {
    const validatorCallExp = this.createValidator(project, expression);
    const validationAssertionIdentifier = FileTransformer.getOrCreateImport(
      expression.getSourceFile(),
      "@nrfcloud/ts-json-schema-transformer",
      "__validation",
    );
    return ts.factory.createCallExpression(validationAssertionIdentifier, undefined, [
      validatorCallExp,
      ts.factory.createFalse(),
      ts.factory.createStringLiteral("object"),
      expression.arguments[0],
    ]);
  }

  public static transformCreateFn(
    project: IProject,
    expression: ts.CallExpression,
  ): ts.Node {
    const validatorCallExp = this.createValidator(project, expression);
    const validationAssertionIdentifier = FileTransformer.getOrCreateImport(
      expression.getSourceFile(),
      "@nrfcloud/ts-json-schema-transformer",
      "__validation",
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
        ts.factory.createFalse(),
        ts.factory.createStringLiteral("object"),
      ],
    );
  }
}
