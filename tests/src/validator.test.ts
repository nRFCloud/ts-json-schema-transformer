import { getValidator } from "../../dist";
import { ByteType, ISODateTime, ISOTime, SimpleType } from "./types";

export interface InputEvent {
  foo: TenantId;
  /**
   * @minimum 0
   * @maximum 100
   */
  other: number;
  stuff?: boolean;
}

/**
 * @maxLength 10
 * @minLength 1
 */
export type ShortString = string;

/**
 * @format date_time
 */
export type TenantId = string;

describe("Validator", () => {
  describe("Simple Schema", () => {
    const validator = getValidator<SimpleType>();

    it("should validate a simple schema", () => {
      expect(validator({ foo: "bar" })).toBeTruthy();
    });

    it("should not validate a simple schema", () => {
      expect(validator({ test: true })).toBeFalsy();

      expect(validator.errors).toEqual([
        {
          instancePath: "",
          keyword: "required",
          message: "must have required property 'foo'",
          params: {
            missingProperty: "foo",
          },
          schemaPath: "#/definitions/SimpleType/required",
        },
        {
          instancePath: "",
          keyword: "additionalProperties",
          message: "must NOT have additional properties",
          params: {
            additionalProperty: "test",
          },
          schemaPath: "#/definitions/SimpleType/additionalProperties",
        },
      ]);
    });
  });

  describe("Should validate schema with type alias", () => {
    const validator = getValidator<InputEvent>();

    it("should validate schema", () => {
      expect(validator({
        foo: "2021-01-01T00:00:00Z",
        other: 50,
      })).toBeTruthy();
    });

    it("should not validate schema", () => {
      expect(validator({
        foo: "2021-01-01",
        other: 150,
      })).toBeFalsy();

      expect(validator.errors).toEqual([
        {
          instancePath: "/foo",
          keyword: "format",
          message: "must match format \"date_time\"",
          params: {
            format: "date_time",
          },
          schemaPath: "#/definitions/TenantId/format",
        },
        {
          instancePath: "/other",
          keyword: "maximum",
          message: "must be <= 100",
          params: {
            comparison: "<=",
            limit: 100,
          },
          schemaPath: "#/properties/other/maximum",
        },
      ]);
    });
  });

  describe("Should validate formats", () => {
    const isoDateTimeValidator = getValidator<ISODateTime>();

    it("should validate iso-date-time", () => {
      expect(isoDateTimeValidator("2021-01-01T00:00:00Z")).toBeTruthy();
    });

    it("should not validate iso-date-time", () => {
      expect(isoDateTimeValidator("2021-01-01")).toBeFalsy();
    });

    const isoTimeValidator = getValidator<ISOTime>();

    it("should validate iso_time", () => {
      expect(isoTimeValidator("00:00:00Z")).toBeTruthy();
    });

    it("should not validate iso_time", () => {
      expect(isoTimeValidator("2021-01-01")).toBeFalsy();
    });

    it("Should validate a byte schema", () => {
      const byteValidator = getValidator<ByteType>();

      expect(byteValidator("aGVsbG8gd29ybGQ=")).toBeTruthy();
      expect(byteValidator("aGVsbG8gd29ybGQ")).toBeFalsy();
    });
  });

  describe("Should validate string length", () => {
    const validator = getValidator<ShortString>();

    it("should validate string length", () => {
      expect(validator("a")).toBeTruthy();
    });

    it("should not validate string length", () => {
      expect(validator("aaaaaaaaaaaaaaaaaaaa")).toBeFalsy();
    });
  });
  // TODO: more tests
});
