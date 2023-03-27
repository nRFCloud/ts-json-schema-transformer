import * as ts from "typescript";
import { IProject } from "../project.js";
import { getGenericArg } from "./utils.js";

export abstract class GetSchemaTransformer {
  public static transform(project: IProject, expression: ts.CallExpression): ts.Node {
    const [type, node] = getGenericArg(project, expression);

    if (type.isTypeParameter()) {
      throw new Error(
        `Error on getSchema: non-specified generic argument.`,
      );
    }

    const schema = project.schemaGenerator.createSchemaFromNodes([node]);

    return convertObjectToLiteralExpression(schema as Record<string, unknown>);
  }
}

/**
 * takes a json object and recursively converts it to an object literal expression
 */
function convertObjectToLiteralExpression(
  object: Record<string, unknown>,
): ts.ObjectLiteralExpression {
  const properties: ts.ObjectLiteralElementLike[] = [];
  for (const [key, value] of Object.entries(object)) {
    properties.push(
      ts.factory.createPropertyAssignment(
        ts.factory.createStringLiteral(key),
        convertValueToExpression(value),
      ),
    );
  }
  return ts.factory.createObjectLiteralExpression(properties);
}

function convertValueToExpression(value: unknown): ts.Expression {
  if (typeof value === "string") {
    return ts.factory.createStringLiteral(value);
  } else if (typeof value === "number") {
    return ts.factory.createNumericLiteral(value);
  } else if (typeof value === "boolean") {
    return ts.factory.createTrue();
  } else if (typeof value === "object") {
    if (Array.isArray(value)) {
      return ts.factory.createArrayLiteralExpression(
        value.map(convertValueToExpression),
      );
    }
    return convertObjectToLiteralExpression(value as Record<string, unknown>);
  } else if (value === null) {
    return ts.factory.createNull();
  } else {
    throw new Error(`Unknown type ${typeof value}`);
  }
}
