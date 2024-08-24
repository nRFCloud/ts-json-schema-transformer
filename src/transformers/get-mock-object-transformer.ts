import { JSONSchema7 } from "json-schema";

import seedrandom from "seedrandom";
import { ts as schemaGeneratorTs } from "ts-json-schema-generator";
import * as ts from "typescript";
import { IProject } from "../project.js";
import { addFormatsJsf, convertValueToExpression, derefJSONSchemaRoot, getGenericArg } from "./utils.js";

// @ts-expect-error Using an esm type import
type jsf = import("json-schema-faker");
const jsf = require("json-schema-faker");

addFormatsJsf();

export abstract class GetMockObjectTransformer {
  public static transform(project: IProject, expression: ts.CallExpression): ts.Node {
    const [type, node] = getGenericArg(project, expression);
    const [, seedNode, seedProvided] = getGenericArg(project, expression, 1);

    if (type.isTypeParameter()) {
      throw new Error(
        `Error on getSchema: non-specified generic argument.`,
      );
    }

    let specifiedSeed: string | undefined = undefined;
    if (
      seedProvided && seedNode != undefined && ts.isLiteralTypeNode(seedNode) && ts.isStringLiteral(seedNode.literal)
    ) {
      specifiedSeed = seedNode.literal.text;
    }
    if (project.options.mock.seed !== false || specifiedSeed) {
      jsf.option("random", seedrandom(project.options.mock.seed || specifiedSeed));
    } else {
      jsf.option("random", Math.random);
    }

    const schema = derefJSONSchemaRoot(project.schemaGenerator.createSchemaFromNodes([node as schemaGeneratorTs.Node]));
    return convertValueToExpression(jsf.generate(schema as JSONSchema7));
  }
}
