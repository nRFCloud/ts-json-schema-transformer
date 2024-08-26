import { createMockFn, createValidateFn, getMockObject } from "@nrfcloud/ts-json-schema-transformer";
import {
  ComplexType,
  ISODateTime,
  ISOTime,
  ServiceProcessStatus,
  SimpleType,
  TenantId,
  ULID,
  UnionType,
} from "./types";

describe("Mock Objects", () => {
  describe("Simple Mocks", () => {
    it("should generate a simple mock", () => {
      const mock = getMockObject<SimpleType>();
      const validator = createValidateFn<SimpleType>();

      expect(validator(mock)).toBeTruthy();
    });

    it("should generate a schema from a nominal type", () => {
      const mock = getMockObject<TenantId>();
      const validator = createValidateFn<TenantId>();

      expect(validator(mock)).toBeTruthy();
    });
  });

  describe("Complex Schemas", () => {
    it("should generate a complex schema", () => {
      const mock = getMockObject<UnionType>();
      const validator = createValidateFn<UnionType>();

      expect(validator(mock)).toBeTruthy();
    });

    it("Should from a type the includes an encoded reference", () => {
      const mock = getMockObject<ServiceProcessStatus>();
      const validator = createValidateFn<ServiceProcessStatus>();

      expect(validator(mock)).toBeTruthy();
    });
  });

  describe("Formats", () => {
    it("should generate an iso date time schema", () => {
      const mock = getMockObject<ISODateTime>();
      const validator = createValidateFn<ISODateTime>();

      expect(validator(mock)).toBeTruthy();
    });

    it("should generate an iso time schema", () => {
      const mock = getMockObject<ISOTime>();
      const validator = createValidateFn<ISOTime>();

      expect(validator(mock)).toBeTruthy();
    });
  });

  describe("Patterns", () => {
    it("should generate a ULID", () => {
      const mock = getMockObject<ULID>();
      const validator = createValidateFn<ULID>();

      expect(validator(mock)).toBeTruthy();
    });

    it("should generate a UUID", () => {
      const mock = getMockObject<TenantId>();
      const validator = createValidateFn<TenantId>();

      expect(validator(mock)).toBeTruthy();
    });
  });

  describe("Seeds", () => {
    it("should generate two different objects with no seed", () => {
      const test1 = getMockObject<ComplexType>();
      const test2 = getMockObject<ComplexType>();

      expect(test1).not.toMatchObject(test2);
    });

    it("should generate two identical object with a seed", () => {
      const test1 = getMockObject<ComplexType, "coolseed">();
      const test2 = getMockObject<ComplexType, "coolseed">();

      expect(test1).toMatchObject(test2);
    });
  });

  describe("Mock Fn", () => {
    it("should generate a simple mock", () => {
      const fn = createMockFn<SimpleType>();
      const mock = fn();
      const validator = createValidateFn<SimpleType>();

      expect(validator(mock)).toBeTruthy();
    });

    it("should generate a schema from a nominal type", () => {
      const fn = createMockFn<TenantId>();
      const mock = fn();
      const validator = createValidateFn<TenantId>();

      expect(validator(mock)).toBeTruthy();
    });

    it("should generate new objects with each call", () => {
      const fn = createMockFn<SimpleType>();
      const validator = createValidateFn<SimpleType>();
      const mock1 = fn();
      const mock2 = fn();

      expect(mock1).not.toMatchObject(mock2);
      expect(validator(mock1)).toBeTruthy();
      expect(validator(mock2)).toBeTruthy();
    });
  });
});
