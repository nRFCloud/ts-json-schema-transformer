import * as ts from 'typescript';
import {Config, SchemaGenerator, TypeFormatter, NodeParser} from 'ts-json-schema-generator'

export interface IProject {
    program: ts.Program,
    config: Config,
    checker: ts.TypeChecker,
    schemaGenerator: SchemaGenerator,
    typeFormatter: TypeFormatter,
    nodeParser: NodeParser,
    formatsPath: string,
}

export interface IOptions extends Config {
}
