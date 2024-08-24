import ts from "typescript";
import { IProject } from "../project.js";
import { AssertTransformer } from "./assert-transformer";
import { GetSchemaTransformer } from "./get-schema-transformer.js";
import { MockTransformer } from "./mock-transformer";
import { ParseTransformer } from "./parse-transformer.js";
import { hasTransformMarker } from "./utils";
import { ValidateTransformer } from "./validate-transformer.js";

export abstract class CallTransformer {
  public static transform(project: IProject, expression: ts.CallExpression): ts.Node {
    const declaration: ts.Declaration | undefined = project.checker.getResolvedSignature(expression)?.declaration;
    if (declaration == null) return expression;
    if (!ts.isFunctionDeclaration(declaration)) return expression;
    const name = declaration?.name?.getText();
    if (name == null) return expression;

    const functor = CALL_PROCESSORS[name];
    if (functor === undefined) return expression;

    if (!hasTransformMarker(declaration)) return expression;

    return functor(project, expression);
  }
}

type Task = (project: IProject, expression: ts.CallExpression) => ts.Node;

const CALL_PROCESSORS: Record<string, Task> = {
  "getSchema": GetSchemaTransformer.transform.bind(GetSchemaTransformer),
  "createValidateFn": ValidateTransformer.transformCreateFn.bind(ValidateTransformer),
  "validate": ValidateTransformer.transform.bind(ValidateTransformer),
  "mock": MockTransformer.transform.bind(MockTransformer),
  "getMockObject": MockTransformer.transform.bind(MockTransformer),
  "assertValid": AssertTransformer.transformWithReturn.bind(AssertTransformer),
  "assert": AssertTransformer.transformWithReturn.bind(AssertTransformer),
  "assertGuard": AssertTransformer.transform.bind(AssertTransformer),
  "createAssertGuardFn": AssertTransformer.transformCreateFn.bind(AssertTransformer),
  "createAssertFn": AssertTransformer.transformCreateFnWithReturn.bind(AssertTransformer),
  "parse": ParseTransformer.transform.bind(ParseTransformer),
  "assertParse": ParseTransformer.transformWithAssert.bind(ParseTransformer),
  "createParseFn": ParseTransformer.transformCreateFn.bind(ParseTransformer),
  "createAssertParseFn": ParseTransformer.transformCreateFnWithAssert.bind(ParseTransformer),
};
