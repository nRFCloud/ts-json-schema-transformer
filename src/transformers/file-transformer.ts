import ts from "typescript";
import { IProject } from "../project.js";
import { NodeTransformer } from "./node-transformer.js";

export abstract class FileTransformer {
  public static transform(project: IProject, context: ts.TransformationContext, file: ts.SourceFile): ts.SourceFile {
    if (file.isDeclarationFile) return file;
    const transformed = ts.visitEachChild(
      file,
      (node) => FileTransformer.iterate_node(project, context, node),
      context,
    );

    const nodesToAdd = FileTransformer.getStatementsForFile(file);
    if (nodesToAdd == null) return transformed;

    const updated = ts.factory.updateSourceFile(
      transformed,
      [
        ...nodesToAdd.start,
        ...transformed.statements,
        ...nodesToAdd.end,
      ],
    );

    FileTransformer.FILE_NODE_MAP.delete(file.fileName);
    FileTransformer.IMPORT_MAP.delete(file.fileName);
    return updated;
  }

  private static FILE_NODE_MAP = new Map<string, { start: ts.Statement[]; end: ts.Statement[] }>();

  private static iterate_node(
    project: IProject,
    context: ts.TransformationContext,
    node: ts.Node,
  ): ts.Node {
    return ts.visitEachChild(
      FileTransformer.try_transform_node(project, node),
      (child) => FileTransformer.iterate_node(project, context, child),
      context,
    );
  }

  private static try_transform_node(project: IProject, node: ts.Node): ts.Node {
    try {
      return NodeTransformer.transform(project, node);
    } catch (exp) {
      if (!(exp instanceof Error)) throw exp;

      const file: ts.SourceFile = node.getSourceFile();
      if (file?.getLineAndCharacterOfPosition != null) {
        const { line, character } = file.getLineAndCharacterOfPosition(
          node.pos,
        );
        exp.message += ` - ${file.fileName}:${line + 1}:${character + 1}`;
      }
      throw exp;
    }
  }

  public static addStatementToFile(file: ts.SourceFile, statement: ts.Statement, type: "start" | "end") {
    const nodes = FileTransformer.FILE_NODE_MAP.get(file.fileName) || { start: [], end: [] };
    nodes[type].push(statement);
    FileTransformer.FILE_NODE_MAP.set(file.fileName, nodes);
  }

  public static getStatementsForFile(file: ts.SourceFile) {
    const nodes = FileTransformer.FILE_NODE_MAP.get(file.fileName) || undefined;
    return nodes;
  }

  private static IMPORT_MAP = new Map<string, Map<string, Map<string, ts.Identifier>>>();
  public static getOrCreateImport(file: ts.SourceFile, packageName: string, namedImport: string): ts.Identifier {
    const imports = FileTransformer.IMPORT_MAP.get(file.fileName) || new Map<string, Map<string, ts.Identifier>>();
    FileTransformer.IMPORT_MAP.set(file.fileName, imports);
    const namedImports = imports.get(packageName) || new Map<string, ts.Identifier>();
    imports.set(packageName, namedImports);

    let importIdentifier = namedImports.get(namedImport);
    if (importIdentifier != null) return importIdentifier;
    importIdentifier = ts.factory.createUniqueName(namedImport);
    namedImports.set(namedImport, importIdentifier);

    FileTransformer.addStatementToFile(
      file,
      ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          false,
          undefined,
          ts.factory.createNamedImports([
            ts.factory.createImportSpecifier(false, ts.factory.createIdentifier(namedImport), importIdentifier),
          ]),
        ),
        ts.factory.createStringLiteral(packageName),
      ),
      "start",
    );
    FileTransformer.IMPORT_MAP.set(file.fileName, imports);
    return importIdentifier;
  }
}
