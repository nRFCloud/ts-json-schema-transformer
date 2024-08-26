import * as tjs from "@nrfcloud/ts-json-schema-transformer";
import { SimpleType } from "./types";

describe("Rebound calls", () => {
  describe("Wildcard import", () => {
    it("should not throw on assert", () => {
      expect(() => tjs.assert<string>("")).not.toThrowError();
    });

    it("should not throw on assertGuard", () => {
      expect(() => tjs.assertGuard<string>("")).not.toThrowError();
    });

    it("Should validate a simple schema", () => {
      const isValid = tjs.guard<SimpleType>({ foo: "bar" });
      expect(isValid).toBe(true);
    });

    it("Should invalidate a simple schema", () => {
      const isValid = tjs.guard<SimpleType>({ test: true });
      expect(isValid).toBe(false);
    });

    it("Should invalidate a simple schema with an inline call", () => {
      expect(tjs.guard<SimpleType>({ test: true })).toBe(false);
    });

    it("Should create a validator", () => {
      const validator = tjs.createGuardFn<SimpleType>();
      expect(validator({ foo: "bar" })).toBe(true);
    });
  });
});
