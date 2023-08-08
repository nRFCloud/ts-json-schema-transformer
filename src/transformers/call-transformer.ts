import ts from "typescript";
import { IProject } from "../project.js";
import { AssertValidTransformer } from "./assert-valid-transformer.js";
import { GetMockObjectTransformer } from "./get-mock-object-transformer";
import { GetSchemaTransformer } from "./get-schema-transformer.js";
import { hasTransformMarker } from "./utils";
import { ValidateTransformer } from "./validate-transformer.js";

export abstract class CallTransformer {
  public static transform(project: IProject, expression: ts.CallExpression): ts.Node {
    if (expression.getSourceFile() == null) {
      return ts.factory.createIdentifier("FUCK");
    }

    const declaration: ts.Declaration | undefined = project.checker.getResolvedSignature(expression)?.declaration;
    if (declaration == null) return expression;
    if (!ts.isFunctionDeclaration(declaration)) return expression;
    const name = declaration?.name?.getText();
    if (name == null) return expression;

    const functor = METHOD_DECORATOR_PROCESSORS[name];
    if (functor === undefined) return expression;

    if (!hasTransformMarker(declaration)) return expression;

    return functor(project, expression);
  }
}

type Task = (project: IProject, expression: ts.CallExpression) => ts.Node;

const METHOD_DECORATOR_PROCESSORS: Record<string, Task> = {
  "getSchema": GetSchemaTransformer.transform,
  "getValidator": ValidateTransformer.transform,
  "getMockObject": GetMockObjectTransformer.transform,
  "assertValid": AssertValidTransformer.transform,
};
