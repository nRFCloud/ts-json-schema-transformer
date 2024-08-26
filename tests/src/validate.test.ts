import { createValidateFn, validate } from "../../dist";
import { ISODateTime, ISOTime, SimpleType } from "./types";

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
    const validator = createValidateFn<SimpleType>();

    it("should validate a simple schema", () => {
      // expect(validator({ foo: "bar" })).toBeTruthy();
      expect(validate<SimpleType>({ foo: "bar" })).toMatchObject({ foo: "bar" });
    });

    it("should not validate a simple schema", () => {
      expect(validator({ test: true })).toBeUndefined();
    });
  });

  describe("Should validate schema with type alias", () => {
    const validator = createValidateFn<InputEvent>();

    it("should validate schema", () => {
      expect(validator({ foo: "2021-01-01T00:00:00Z", other: 50 })).toMatchObject({
        foo: "2021-01-01T00:00:00Z",
        other: 50,
      });
    });

    it("should not validate schema", () => {
      expect(validator({ foo: "2021-01-01", other: 150 })).toBeUndefined();
    });
  });

  describe("Should validate formats", () => {
    const isoDateTimeValidator = createValidateFn<ISODateTime>();

    it("should validate iso-date-time", () => {
      expect(isoDateTimeValidator("2021-01-01T00:00:00Z")).toMatch("2021-01-01T00:00:00Z");
    });

    it("should not validate iso-date-time", () => {
      expect(isoDateTimeValidator("2021-01-01")).toBeUndefined();
    });

    const isoTimeValidator = createValidateFn<ISOTime>();

    it("should validate iso_time", () => {
      expect(isoTimeValidator("00:00:00Z")).toMatch("00:00:00Z");
    });

    it("should not validate iso_time", () => {
      expect(isoTimeValidator("2021-01-01")).toBeUndefined();
    });
  });

  describe("Should validate string length", () => {
    const validator = createValidateFn<ShortString>();

    it("should validate string length", () => {
      expect(validator("aaaaaaaaa")).toMatch("aaaaaaaaa");
    });

    it("should not validate string length", () => {
      expect(validator("aaaaaaaaaaaaaaaaaaaa")).toBeUndefined();
    });
  });

  describe("Should validate inline", () => {
    it("should validate inline", () => {
      const isValid = validate<SimpleType>({ "foo": "bar" });
      expect(isValid).toMatchObject({ "foo": "bar" });
    });

    it("should invalidate inline", () => {
      const isValid = validate<SimpleType>({ test: true });
      expect(isValid).toBeUndefined();
    });
  });
});
