import { getSchema } from "ts-json-schema-transformer";
import { SimpleType, TenantId, UnionType } from "./types";

describe("Schema", () => {
  describe("Simple Schemas", () => {
    it("should generate a simple schema", () => {
      const schema = getSchema<SimpleType>();

      expect(schema).toEqual({
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$ref": "#/definitions/SimpleType",
        "definitions": {
          "SimpleType": {
            "type": "object",
            "properties": { "foo": { "type": "string" } },
            "required": ["foo"],
            "additionalProperties": false,
          },
        },
      });
    });

    it("should generate a schema from a nominal type", () => {
      const schema = getSchema<TenantId>();

      expect(schema).toEqual({
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$ref": "#/definitions/TenantId",
        "definitions": {
          "TenantId": {
            "$ref": "#/definitions/Nominal%3Cstring%2C%22TenantId%22%3E",
            "format": "uuid",
          },
          "Nominal<string,\"TenantId\">": { "type": ["string"] },
        },
      });
    });
  });

  describe("Complex Schemas", () => {
    it("should generate a complex schema", () => {
      const schema = getSchema<UnionType>();

      expect(schema).toEqual({
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$ref": "#/definitions/UnionType",
        "definitions": {
          "UnionType": { "anyOf": [{ "$ref": "#/definitions/ComplexType" }, { "$ref": "#/definitions/SimpleType" }] },
          "ComplexType": {
            "type": "object",
            "properties": {
              "foo": { "$ref": "#/definitions/ConditionalType%3Cstring%3E" },
              "bar": { "type": "number" },
              "baz": { "type": "boolean" },
            },
            "required": ["foo", "bar", "baz"],
            "additionalProperties": false,
          },
          "ConditionalType<string>": { "type": "string" },
          "SimpleType": {
            "type": "object",
            "properties": { "foo": { "type": "string" } },
            "required": ["foo"],
            "additionalProperties": false,
          },
        },
      });
    });
  });
});
