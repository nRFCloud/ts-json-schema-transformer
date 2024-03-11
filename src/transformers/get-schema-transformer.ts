import { ts as schemaGeneratorTs } from "ts-json-schema-generator";
import * as ts from "typescript";
import { IProject } from "../project.js";
import { convertObjectToLiteralExpression, getGenericArg } from "./utils.js";

export abstract class GetSchemaTransformer {
  public static transform(project: IProject, expression: ts.CallExpression): ts.Node {
    const [type, node] = getGenericArg(project, expression);

    if (type.isTypeParameter()) {
      throw new Error(
        `Error on getSchema: non-specified generic argument.`,
      );
    }

    const schema = project.schemaGenerator.createSchemaFromNodes([node as schemaGeneratorTs.Node]);
    return convertObjectToLiteralExpression(schema as Record<string, unknown>);
  }
}
