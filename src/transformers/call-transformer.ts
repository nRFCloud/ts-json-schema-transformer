import * as path from "path";
import ts from "typescript";
import { IProject } from "../project.js";
import { GetMockObjectTransformer } from "./get-mock-object-transformer";
import { GetSchemaTransformer } from "./get-schema-transformer.js";
import { ValidateTransformer } from "./validate-transformer.js";

const LIB_PATHS = [
  path.join("ts-json-schema-transformer", "dist"),
];

export abstract class CallTransformer {
  public static transform(project: IProject, expression: ts.CallExpression): ts.Node {
    if (expression.getSourceFile() == null) {
      return ts.factory.createIdentifier("FUCK");
    }

    const declaration: ts.Declaration | undefined = project.checker.getResolvedSignature(expression)?.declaration;
    if (!declaration) return expression;

    const file: string = path.resolve(declaration.getSourceFile().fileName);
    if (
      !LIB_PATHS.some(libPath => file.indexOf(libPath) !== -1)
    ) return expression;

    const { name } = project.checker.getTypeAtLocation(declaration).symbol;
    const functor = METHOD_DECORATOR_PROCESSORS[name];
    if (functor === undefined) return expression;
    return functor(project, expression);
  }
}

type Task = (project: IProject, expression: ts.CallExpression) => ts.Node;

const METHOD_DECORATOR_PROCESSORS: Record<string, Task> = {
  "getSchema": GetSchemaTransformer.transform,
  "getValidator": ValidateTransformer.transform,
  "getMockObject": GetMockObjectTransformer.transform,
};
