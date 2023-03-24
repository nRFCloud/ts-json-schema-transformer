import {IProject} from "../project.js";
import * as ts from "typescript";
import {getGenericArg} from "./utils.js";

export abstract class GetSchemaTransformer {
    public static transform(project: IProject, expression: ts.CallExpression): ts.Node {

        const [type, node, generic] = getGenericArg(project, expression);

        if (type.isTypeParameter())
            throw new Error(
                `Error on getSchema: non-specified generic argument.`,
            );

        const schema = project.schemaGenerator.createSchemaFromNodes([node]);

        return convertObjectToLiteralExpression(schema);
    }
}

/**
 * takes a json object and recursively converts it to an object literal expression
 */
function convertObjectToLiteralExpression(
    object: any,
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
        return convertObjectToLiteralExpression(value);
    } else if (value === null) {
        return ts.factory.createNull();
    } else {
        throw new Error(`Unknown type ${typeof value}`);
    }
}
