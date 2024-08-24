import * as tsj from "@nrfcloud/ts-json-schema-transformer";
import { SimpleType } from "./types";

describe("Rebound calls", () => {
  describe("Wildcard import", () => {
    it("should not throw on assert", () => {
      expect(() => tsj.assert<string>("")).not.toThrowError();
    });

    it("should not throw on assertGuard", () => {
      expect(() => tsj.assertGuard<string>("")).not.toThrowError();
    });

    it("Should validate a simple schema", () => {
      const isValid = tsj.validate<SimpleType>({ foo: "bar" });
      expect(isValid).toBe(true);
    });

    it("Should invalidate a simple schema", () => {
      const isValid = tsj.validate<SimpleType>({ test: true });
      expect(isValid).toBe(false);
    });

    it("Should invalidate a simple schema with an inline call", () => {
      expect(tsj.validate<SimpleType>({ test: true })).toBe(false);
    });

    it("Should create a validator", () => {
      const validator = tsj.createValidateFn<SimpleType>();
      expect(validator({ foo: "bar" })).toBe(true);
    });
  });
});
