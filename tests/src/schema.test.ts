import { getSchema } from "../../dist";
import { ByteType, ISODateTime, ISOTime, SimpleType, TenantId, ULID, UnionType } from "./types";

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

  describe("Formats", () => {
    it("should generate an iso date time schema", () => {
      const schema = getSchema<ISODateTime>();

      expect(schema).toEqual({
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$ref": "#/definitions/ISODateTime",
        "definitions": {
          "ISODateTime": {
            "type": "string",
            "format": "iso-date-time",
          },
        },
      });
    });

    it("should generate an iso time schema", () => {
      const schema = getSchema<ISOTime>();

      expect(schema).toEqual({
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$ref": "#/definitions/ISOTime",
        "definitions": {
          "ISOTime": {
            "type": "string",
            "format": "iso-time",
          },
        },
      });
    });

    it("Should generate a byte schema", () => {
      const schema = getSchema<ByteType>();

      expect(schema).toEqual({
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$ref": "#/definitions/ByteType",
        "definitions": {
          "ByteType": {
            "type": "string",
            "format": "byte",
          },
        },
      });
    });
  });

  describe("Pattern", () => {
    it("should generate a ULID pattern", () => {
      const schema = getSchema<ULID>();

      expect(schema).toEqual({
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$ref": "#/definitions/ULID",
        "definitions": {
          "ULID": {
            "$ref": "#/definitions/Nominal%3Cstring%2C%22ULID%22%3E",
            "pattern": "^[0-9A-HJKMNP-TV-Z]{26}$",
          },
          "Nominal<string,\"ULID\">": { "type": ["string"] },
        },
      });
    });
  });
});
