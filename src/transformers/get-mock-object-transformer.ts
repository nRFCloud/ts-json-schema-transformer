import { JSONSchema7 } from "json-schema";

const { JSONSchemaFaker: jsf } = require("json-schema-faker");
import { ts as schemaGeneratorTs } from "ts-json-schema-generator";
import * as ts from "typescript";
import { IProject } from "../project.js";
import { addFormatsJsf, convertValueToExpression, derefJSONSchemaRoot, getGenericArg } from "./utils.js";

addFormatsJsf();

export abstract class GetMockObjectTransformer {
  public static transform(project: IProject, expression: ts.CallExpression): ts.Node {
    const [type, node] = getGenericArg(project, expression);

    if (type.isTypeParameter()) {
      throw new Error(
        `Error on getSchema: non-specified generic argument.`,
      );
    }

    const schema = derefJSONSchemaRoot(project.schemaGenerator.createSchemaFromNodes([node as schemaGeneratorTs.Node]));

    return convertValueToExpression(jsf.generate(schema as JSONSchema7));
  }
}
