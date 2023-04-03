import { getMockObject, getValidator } from "../../dist";
import { ISODateTime, ISOTime, SimpleType, TenantId, UnionType } from "./types";

describe("Mock Objects", () => {
  describe("Simple Mocks", () => {
    it("should generate a simple mock", () => {
      const mock = getMockObject<SimpleType>();
      const validator = getValidator<SimpleType>();

      expect(validator(mock)).toBeTruthy();
    });

    it("should generate a schema from a nominal type", () => {
      const mock = getMockObject<TenantId>();
      const validator = getValidator<TenantId>();

      expect(validator(mock)).toBeTruthy();
    });
  });

  describe("Complex Schemas", () => {
    it("should generate a complex schema", () => {
      const mock = getMockObject<UnionType>();
      const validator = getValidator<UnionType>();

      expect(validator(mock)).toBeTruthy();
    });
  });

  describe("Formats", () => {
    it("should generate an iso date time schema", () => {
      const mock = getMockObject<ISODateTime>();
      const validator = getValidator<ISODateTime>();

      expect(validator(mock)).toBeTruthy();
    });

    it("should generate an iso time schema", () => {
      const mock = getMockObject<ISOTime>();
      const validator = getValidator<ISOTime>();

      expect(validator(mock)).toBeTruthy();
    });
  });
});
