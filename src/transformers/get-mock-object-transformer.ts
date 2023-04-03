const { JSONSchemaFaker: jsf } = require("json-schema-faker");
import * as ts from "typescript";
import { IProject } from "../project.js";
import { addFormatsJsf, convertValueToExpression, getGenericArg } from "./utils.js";

addFormatsJsf();
export abstract class GetMockObjectTransformer {
  public static transform(project: IProject, expression: ts.CallExpression): ts.Node {
    const [type, node] = getGenericArg(project, expression);

    if (type.isTypeParameter()) {
      throw new Error(
        `Error on getSchema: non-specified generic argument.`,
      );
    }

    const schema = project.schemaGenerator.createSchemaFromNodes([node]);

    const obj = jsf.generate(schema);

    return convertValueToExpression(obj);
  }
}
