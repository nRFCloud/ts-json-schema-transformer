import { assertParse, createAssertParseFn, createParseFn, parse } from "@nrfcloud/ts-json-schema-transformer";
import { Endpoint, SimpleType } from "./types";

describe("Parser Tests", () => {
  describe("Parse", () => {
    it("should parse a simple schema", () => {
      const result = parse<SimpleType>("{\"foo\":\"bar\"}");
      expect(result).toMatchObject({ foo: "bar" });
    });

    it("should parse a complex schema", () => {
      const result = parse<Endpoint>("{\"protocol\":\"http\",\"hostname\":\"foo.com\",\"pathname\":\"/blah_blah\"}");
      expect(result).toMatchObject({
        protocol: "http",
        hostname: "foo.com",
        pathname: "/blah_blah",
      });
    });

    it("should return undefined on invalid schema", () => {
      const result = parse<Endpoint>("{\"protocol\":\"http\",\"hostname\":\"foo.com\",\"pathname\":42}");
      expect(result).toBeUndefined();
    });
  });

  describe("Create Parse Fn", () => {
    it("should create a parse function", () => {
      const parseServiceURL = createParseFn<Endpoint>();
      const result = parseServiceURL("{\"protocol\":\"http\",\"hostname\":\"foo.com\",\"pathname\":\"/blah_blah\"}");
      expect(result).toMatchObject({
        protocol: "http",
        hostname: "foo.com",
        pathname: "/blah_blah",
      });
    });

    it("should return undefined on invalid schema", () => {
      const parseServiceURL = createParseFn<Endpoint>();
      const result = parseServiceURL("{\"protocol\":\"http\",\"hostname\":\"foo.com\",\"pathname\":42}");
      expect(result).toBeUndefined();
    });
  });

  describe("Assert Parse", () => {
    it("should assert a simple schema", () => {
      expect(() => assertParse<SimpleType>("{\"foo\":\"bar\"}")).not.toThrowError();
    });

    it("should assert a complex schema", () => {
      expect(() =>
        assertParse<Endpoint>("{\"protocol\":\"http\",\"hostname\":\"foo.com\",\"pathname\":\"/blah_blah\"}")
      ).not.toThrowError();
    });

    it("should throw on invalid schema", () => {
      expect(() => assertParse<Endpoint>("{\"protocol\":\"http\",\"hostname\":\"foo.com\",\"pathname\":42}"))
        .toThrowError();
    });
  });

  describe("Create Assert Parse Fn", () => {
    it("should create an assert parse function", () => {
      const assertParseServiceURL = createAssertParseFn<Endpoint>();
      expect(() =>
        assertParseServiceURL("{\"protocol\":\"http\",\"hostname\":\"foo.com\",\"pathname\":\"/blah_blah\"}")
      ).not.toThrowError();
    });

    it("should throw on invalid schema", () => {
      const assertParseServiceURL = createAssertParseFn<Endpoint>();
      expect(() => assertParseServiceURL("{\"protocol\":\"http\",\"hostname\":\"foo.com\",\"pathname\":42}"))
        .toThrowError();
    });
  });
});
