import { ts as schemaGeneratorTs } from "ts-json-schema-generator";
import * as ts from "typescript";
import { IProject } from "../project.js";
import { schemaToValidator } from "../transformer-utils.js";
import { FileTransformer } from "./file-transformer.js";
import { getGenericArg } from "./utils.js";

export abstract class AssertValidTransformer {
  public static transform(project: IProject, expression: ts.CallExpression): ts.Node {
    // Get the type info
    const [type, node] = getGenericArg(project, expression);

    if (type.isTypeParameter()) {
      throw new Error(
        `Error on getSchema: non-specified generic argument.`,
      );
    }
    const schema = project.schemaGenerator.createSchemaFromNodes([node as schemaGeneratorTs.Node]);
    const validatorCallExp = schemaToValidator(schema, project.options.validation);
    const validationAssertionIdentifier = FileTransformer.getOrCreateImport(
      expression.getSourceFile(),
      "@nrfcloud/ts-json-schema-transformer",
      "validationAssertion",
    );
    return ts.factory.createCallExpression(validationAssertionIdentifier, undefined, [
      validatorCallExp,
      expression.arguments[0],
    ]);
  }
}
