import { assertValid, assertValidStrict } from "@nrfcloud/ts-json-schema-transformer";
import { ExampleBaseType, ExampleExtendedType1, ExampleExtendedType2, ServiceURL, SimpleType } from "./types";

describe("Simple Assert Test", () => {
  it("should validate a simple schema", () => {
    expect(() => assertValidStrict<SimpleType>({ foo: "bar" })).not.toThrowError();
    expect(() => assertValidStrict<ServiceURL>("http://foo.com/blah_blah")).not.toThrowError();
  });

  it("should throw on validation error", () => {
    expect(() => assertValidStrict<SimpleType>("2021-01-01T00:00:00Z")).toThrowError();
    expect(() => assertValidStrict<ServiceURL>("http://")).toThrow();
  });

  it("should narrow type", () => {
    const fn = (obj: SimpleType | string) => {
      assertValidStrict<SimpleType>(obj);
      expect(obj.foo).toBeDefined();
    };

    const simpleType: SimpleType = {
      foo: "hello",
    };

    fn(simpleType);
  });

  it("should allow for additional properties", () => {
    const test: ExampleExtendedType1 = {
      name: "Test",
      lat: 41.5,
      lon: 35.5,
    };

    const test2: ExampleExtendedType2 = {
      name: "OtherTest",
      description: "This is a description",
    };

    expect(() => assertValid<ExampleBaseType>(test)).not.toThrowError();
    expect(() => assertValid<ExampleBaseType>(test2)).not.toThrowError();

    expect(() => assertValid<ExampleExtendedType1>(test)).not.toThrowError();
    expect(() => assertValid<ExampleExtendedType2>(test2)).not.toThrowError();

    const fn = (obj: unknown) => {
      assertValid<ExampleBaseType>(obj);
      expect(obj.name).toBeDefined();
    };

    fn(test);
  });

  it("should not allow for additional properties", () => {
    const base: ExampleBaseType = {
      name: "Test",
    };
    const test: ExampleExtendedType1 = {
      ...base,
      lat: 41.5,
      lon: 35.5,
    };

    expect(() => assertValidStrict<ExampleBaseType>(test)).toThrowError();
  });
});
