import seedrandom from "seedrandom";

// @ts-expect-error Using an esm type import
import type { Schema } from "json-schema-faker";
const jsf = require("json-schema-faker");

export function mockFn(seed: string | false, schema: Schema): () => object {
  let rnd = Math.random;
  if (seed !== false) {
    rnd = seedrandom(seed);
  }
  return () => {
    jsf.option("random", rnd);
    return jsf.generate(schema);
  };
}
