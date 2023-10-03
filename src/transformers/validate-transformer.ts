import * as ts from "typescript";
import { IProject } from "../project.js";
import { schemaToValidator } from "../transformer-utils";
import { getGenericArg } from "./utils.js";

/**
 * This is where most of the magic happens.
 * We introspect a schema from the type then generate a validator from it.
 */
export abstract class ValidateTransformer {
  public static transform(project: IProject, expression: ts.CallExpression): ts.Node {
    return transform(project, expression, true);
  }
}

export abstract class StrictValidateTransformer {
  public static transform(project: IProject, expression: ts.CallExpression): ts.Node {
    return transform(project, expression);
  }
}

const transform = (project: IProject, expression: ts.CallExpression, additionalProperties = false): ts.Node => {
  // Get the type info
  const [type, node] = getGenericArg(project, expression);
  if (type.isTypeParameter()) {
    throw new Error(
      `Error on getSchema: non-specified generic argument.`,
    );
  }

  const schema = project.schemaGenerator.createSchemaFromNodes([node], additionalProperties);

  return schemaToValidator(schema, project.options.validation);
};
