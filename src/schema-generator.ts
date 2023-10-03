import { JSONSchema7 } from "json-schema";
import { createFormatter, createParser } from "ts-json-schema-generator";
import { SchemaGenerator as TsJsonSchemaGenerator } from "ts-json-schema-generator";
import ts from "typescript";
import { SchemaConfig } from "./project";

export class SchemaGenerator {
  private readonly schemaGenerator;
  private readonly strictSchemaGenerator;

  constructor(program: ts.Program, schemaConfig: SchemaConfig) {
    const nodeParser = createParser(program, { ...schemaConfig, additionalProperties: true });
    const strictNodeParser = createParser(program, { ...schemaConfig, additionalProperties: false });
    const typeFormatter = createFormatter({ ...schemaConfig });

    this.schemaGenerator = new TsJsonSchemaGenerator(program, nodeParser, typeFormatter, {
      ...schemaConfig,
      additionalProperties: true,
    });
    this.strictSchemaGenerator = new TsJsonSchemaGenerator(program, strictNodeParser, typeFormatter, {
      ...schemaConfig,
      additionalProperties: false,
    });
  }

  public createSchemaFromNodes(nodes: ts.Node[], additionalProperties = false) {
    let schema: JSONSchema7;

    if (additionalProperties) {
      schema = this.schemaGenerator.createSchemaFromNodes(nodes);
    } else {
      schema = this.strictSchemaGenerator.createSchemaFromNodes(nodes);
    }

    return schema;
  }
}
