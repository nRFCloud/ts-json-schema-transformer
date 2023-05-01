import * as ts from "typescript";
import { IProject } from "../project.js";
import { schemaToTs } from "../transformer-utils";
import { getGenericArg } from "./utils.js";

/**
 * This is where most of the magic happens.
 * We introspect a schema from the type then generate a validator from it.
 */
export abstract class ValidateTransformer {
  public static transform(project: IProject, expression: ts.CallExpression): ts.Node {
    // Get the type info
    const [type, node] = getGenericArg(project, expression);
    if (type.isTypeParameter()) {
      throw new Error(
        `Error on getSchema: non-specified generic argument.`,
      );
    }

    const schema = project.schemaGenerator.createSchemaFromNodes([node]);

    const bodyExpression = schemaToTs(schema, project.options.validation);

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
}
