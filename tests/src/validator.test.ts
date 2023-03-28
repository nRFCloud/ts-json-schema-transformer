import { getValidator } from "../../dist";
import { SimpleType } from "./types";

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
      expect(validator({ foo: "2021-01-01T00:00:00Z", other: 50 })).toBeTruthy();
    });

    it("should not validate schema", () => {
      expect(validator({ foo: "2021-01-01", other: 150 })).toBeFalsy();

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

  // TODO: more tests
});
