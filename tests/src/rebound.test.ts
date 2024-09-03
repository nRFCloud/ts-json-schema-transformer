import * as tjs_wildcard from "@nrfcloud/ts-json-schema-transformer";
import tjs_default from "@nrfcloud/ts-json-schema-transformer";

import { SimpleType } from "./types";

describe("Rebound calls", () => {
  describe("Wildcard import", () => {
    it("should not throw on assert", () => {
      expect(() => tjs_wildcard.assert<string>("")).not.toThrowError();
    });

    it("should not throw on assertGuard", () => {
      expect(() => tjs_wildcard.assertGuard<string>("")).not.toThrowError();
    });

    it("Should validate a simple schema", () => {
      const isValid = tjs_wildcard.guard<SimpleType>({ foo: "bar" });
      expect(isValid).toBe(true);
    });

    it("Should invalidate a simple schema", () => {
      const isValid = tjs_wildcard.guard<SimpleType>({ test: true });
      expect(isValid).toBe(false);
    });

    it("Should invalidate a simple schema with an inline call", () => {
      expect(tjs_wildcard.guard<SimpleType>({ test: true })).toBe(false);
    });

    it("Should create a validator", () => {
      const validator = tjs_wildcard.createGuardFn<SimpleType>();
      expect(validator({ foo: "bar" })).toBe(true);
    });
  });

  describe("Default import", () => {
    it("should not throw on assert", () => {
      expect(() => tjs_default.assert<string>("")).not.toThrowError();
    });

    it("should not throw on assertGuard", () => {
      expect(() => tjs_default.assertGuard<string>("")).not.toThrowError();
    });

    it("Should validate a simple schema", () => {
      const isValid = tjs_default.guard<SimpleType>({ foo: "bar" });
      expect(isValid).toBe(true);
    });

    it("Should invalidate a simple schema", () => {
      const isValid = tjs_default.guard<SimpleType>({ test: true });
      expect(isValid).toBe(false);
    });

    it("Should invalidate a simple schema with an inline call", () => {
      expect(tjs_default.guard<SimpleType>({ test: true })).toBe(false);
    });

    it("Should create a validator", () => {
      const validator = tjs_default.createGuardFn<SimpleType>();
      expect(validator({ foo: "bar" })).toBe(true);
    });
  });
});
