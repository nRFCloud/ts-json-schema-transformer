import ts from "typescript";
import { IProject } from "../project.js";
import {CallTransformer} from "./call-transformer.js";

export abstract class NodeTransformer {
    public static transform(project: IProject, node: ts.Node): ts.Node {
        if (ts.isCallExpression(node)) {
            return CallTransformer.transform(project, node);
        }
        return node;
    }
}
