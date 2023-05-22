import { assertValid } from "@nrfcloud/ts-json-schema-transformer";
import { SimpleType } from "./types";

describe("Simple Assert Test", () => {
  it("should validate a simple schema", () => {
    expect(() => assertValid<SimpleType>({ foo: "bar" })).not.toThrowError();
  });

  it("should throw on validation error", () => {
    expect(() => assertValid<SimpleType>("2021-01-01T00:00:00Z")).toThrowError();
  });

  it("should narrow type", () => {
    const fn = (obj: SimpleType | string) => {
      assertValid<SimpleType>(obj);
      expect(obj.foo).toBeDefined();
    };

    const simpleType: SimpleType = {
      foo: "hello",
    };

    fn(simpleType);
  });
});
