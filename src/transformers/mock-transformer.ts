import { JSONSchema7 } from "json-schema";

import seedrandom from "seedrandom";
import { ts as schemaGeneratorTs } from "ts-json-schema-generator";
import * as ts from "typescript";
import { DEFAULT_SEED, IProject } from "../project.js";
import { FileTransformer } from "./file-transformer";
import { addFormatsJsf, convertValueToExpression, derefJSONSchemaRoot, getGenericArg } from "./utils.js";

// @ts-expect-error Using an esm type import
type jsf = import("json-schema-faker");
const jsf = require("json-schema-faker");

addFormatsJsf();

export abstract class MockTransformer {
  private static createSchemaAndSeed(project: IProject, expression: ts.CallExpression) {
    const [type, node] = getGenericArg(project, expression);

    if (type.isTypeParameter()) {
      throw new Error(
        `Error on getSchema: non-specified generic argument.`,
      );
    }

    const seed = this.getSeed(project, expression);
    if (seed !== false) {
      jsf.option("random", seedrandom(seed));
    } else {
      jsf.option("random", Math.random);
    }

    return derefJSONSchemaRoot(project.schemaGenerator.createSchemaFromNodes([node as schemaGeneratorTs.Node]));
  }

  private static getSeed(project: IProject, expression: ts.CallExpression): string | false {
    const [, seedNode, seedProvided] = getGenericArg(project, expression, 1);

    if (
      seedProvided && seedNode != undefined && ts.isLiteralTypeNode(seedNode) && ts.isStringLiteral(seedNode.literal)
    ) {
      return seedNode.literal.text;
    }

    if (project.options.mock.seed !== false) {
      return project.options.mock.seed || DEFAULT_SEED;
    } else {
      return false;
    }
  }

  public static transform(project: IProject, expression: ts.CallExpression): ts.Node {
    const schema = this.createSchemaAndSeed(project, expression);
    return convertValueToExpression(jsf.generate(schema as JSONSchema7));
  }

  public static transformCreateFn(project: IProject, expression: ts.CallExpression): ts.Node {
    const schema = this.createSchemaAndSeed(project, expression);
    const mockFnIdentifier = FileTransformer.getOrCreateImport(
      expression.getSourceFile(),
      "@nrfcloud/ts-json-schema-transformer/dist/jsf",
      "mockFn",
    );
    const seed = this.getSeed(project, expression);

    return ts.factory.createCallExpression(
      mockFnIdentifier,
      undefined,
      [
        seed === false ? ts.factory.createFalse() : ts.factory.createStringLiteral(seed),
        convertValueToExpression(schema as JSONSchema7),
      ],
    );
  }
}
