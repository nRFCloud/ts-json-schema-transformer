import { getValidator } from "ts-json-schema-transformer";
import { SimpleType } from "./types";

describe("Validator", () => {
  describe("Simple Schema", () => {
    it("should validate a simple schema", () => {
      const validator = getValidator<SimpleType>();

      expect(validator({ foo: "bar" })).toBeTruthy();
    });
  });

  // TODO: more tests
});
