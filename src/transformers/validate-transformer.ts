import { ts as schemaGeneratorTs } from "ts-json-schema-generator";
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
}
