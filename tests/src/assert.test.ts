import {
  assert,
  assertGuard,
  assertValid,
  createAssertFn,
  createAssertGuardFn,
  GuardFn,
  ValidationError,
} from "@nrfcloud/ts-json-schema-transformer";
import { ServiceURL, SimpleType } from "./types";

describe("Simple Assert Test", () => {
  describe("Assert Guard", () => {
    it("should validate a simple schema", () => {
      expect(() => assertGuard<SimpleType>({ foo: "bar" })).not.toThrowError();
      expect(() => assertGuard<ServiceURL>("http://foo.com/blah_blah")).not.toThrowError();
    });

    it("should throw on validation error", () => {
      expect(() => assertGuard<SimpleType>("2021-01-01T00:00:00Z")).toThrowError();
      expect(() => assertGuard<ServiceURL>("http://")).toThrow();
    });

    it("should narrow type", () => {
      const fn = (obj: SimpleType | string) => {
        assertGuard<SimpleType>(obj);
        expect(obj.foo).toBeDefined();
      };

      const simpleType: SimpleType = {
        foo: "hello",
      };

      fn(simpleType);
    });

    it("should throw ValidationError object", () => {
      try {
        assertGuard<SimpleType>("2021-01-01T00:00:00Z");
      } catch (e) {
        const error = e as ValidationError;
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.cause).toEqual([
          {
            instancePath: "",
            schemaPath: "#/definitions/SimpleType/type",
            keyword: "type",
            params: { type: "object" },
            message: "must be object",
          },
        ]);
      }
    });

    it("should not return anything", () => {
      const result = assertGuard<SimpleType>({ foo: "bar" });
      expect(result).toBeUndefined();
    });

    it("Deprecated assertValid should return original", () => {
      const result = assertValid<SimpleType>({ foo: "bar" });
      expect(result).toMatchObject({ foo: "bar" });
    });
  });

  describe("Assert Guard Fn", () => {
    it("should validate a simple schema", () => {
      const fn = createAssertGuardFn<SimpleType>();
      expect(() => fn({ foo: "bar" })).not.toThrowError();
    });

    it("should throw on validation error", () => {
      const fn = createAssertGuardFn<SimpleType>();
      expect(() => fn("2021-01-01T00:00:00Z")).toThrowError();
    });

    it("should narrow type", () => {
      const fn: GuardFn<SimpleType> = createAssertGuardFn<SimpleType>();
      const simpleType: SimpleType = {
        foo: "hello",
      };
      fn(simpleType);
      expect(simpleType.foo).toBeDefined();
    });
  });

  describe("Assert", () => {
    it("should validate a simple schema", () => {
      expect(() => assert<SimpleType>({ foo: "bar" })).not.toThrowError();
      expect(() => assert<ServiceURL>("http://foo.com/blah_blah")).not.toThrowError();
    });

    it("should throw on validation error", () => {
      expect(() => assert<SimpleType>("2021-01-01T00:00:00Z")).toThrowError();
      expect(() => assert<ServiceURL>("http://")).toThrow();
    });

    it("should throw ValidationError object", () => {
      try {
        assert<SimpleType>("2021-01-01T00:00:00Z");
      } catch (e) {
        const error = e as ValidationError;
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.cause).toEqual([
          {
            instancePath: "",
            schemaPath: "#/definitions/SimpleType/type",
            keyword: "type",
            params: { type: "object" },
            message: "must be object",
          },
        ]);
      }
    });

    it("should return original object", () => {
      const result = assert<SimpleType>({ foo: "bar" });
      expect(result).toMatchObject({ foo: "bar" });
    });
  });

  describe("Assert Fn", () => {
    it("should validate a simple schema", () => {
      const fn = createAssertFn<SimpleType>();
      expect(() => fn({ foo: "bar" })).not.toThrowError();
    });

    it("should throw on validation error", () => {
      const fn = createAssertFn<SimpleType>();
      expect(() => fn("2021-01-01T00:00:00Z")).toThrowError();
    });

    it("should return original object", () => {
      const fn = createAssertFn<SimpleType>();
      const result = fn({ foo: "bar" });
      expect(result).toMatchObject({ foo: "bar" });
    });
  });

  it("Should assert and return object", () => {
    const test = { foo: "bar" };
    const result = assert<SimpleType>(test);
    expect(test).toMatchObject(result);
  });
});
