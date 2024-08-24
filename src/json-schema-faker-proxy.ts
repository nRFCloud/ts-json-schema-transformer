import seedrandom from "seedrandom";

// @ts-expect-error Using an esm type import
import type { Schema } from "json-schema-faker";
const jsf = require("json-schema-faker");

export function mockFn(seed: string | false, schema: Schema) {
  if (seed !== false) {
    jsf.option("random", seedrandom(seed));
  }
  return jsf.generate(schema);
}
