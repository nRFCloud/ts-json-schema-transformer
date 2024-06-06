import { assertValid, ValidationError } from "@nrfcloud/ts-json-schema-transformer";
import { ServiceURL, SimpleType } from "./types";

describe("Simple Assert Test", () => {
  it("should validate a simple schema", () => {
    expect(() => assertValid<SimpleType>({ foo: "bar" })).not.toThrowError();
    expect(() => assertValid<ServiceURL>("http://foo.com/blah_blah")).not.toThrowError();
  });

  it("should throw on validation error", () => {
    expect(() => assertValid<SimpleType>("2021-01-01T00:00:00Z")).toThrowError();
    expect(() => assertValid<ServiceURL>("http://")).toThrow();
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

  it("should throw ValidationError object", () => {
    try {
      assertValid<SimpleType>("2021-01-01T00:00:00Z");
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
});
