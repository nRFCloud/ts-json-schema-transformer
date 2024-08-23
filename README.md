# ts-json-schema-transformer

**A TypeScript transformer that generates JSON schemas and validators from TypeScript interfaces**

## Description

This package provides a TypeScript transformer that generates JSON schemas and validators from TypeScript interfaces.
It uses [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator) to introspect types and
[ajv](https://github.com/ajv-validator/ajv) to generate validator functions. Functions and schema are generated inline
at compile time using a custom typescript transformer.

## Installation

#### Requirements

- typescript >= 5

#### First, install the package

You can use any package manager. I prefer pnpm, but yarn and npm should work fine.

```bash
pnpm add -D @nrfcloud/ts-json-schema-transformer
# OR
yarn add -D @nrfcloud/ts-json-schema-transformer
# OR
npm install -D @nrfcloud/ts-json-schema-transformer
```

#### Next, install your preferred typescript plugin solution

Both [ts-patch](https://github.com/nonara/ts-patch) and [ttypescript](https://github.com/cevek/ttypescript)
should work, though I recommend `ts-patch` since it seems better supported.

```bash
pnpm add -D ts-patch

# You'll want to add this line to your package.json prepare script
pnpm ts-pach install -s

# --- OR ---
pnpm add -D ttypescript
```

#### Lastly, add the plugin configuration to your `tsconfig.json` file

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "@nrfcloud/ts-json-schema-transformer/dist/transform"
      }
    ]
  }
}
```

## Usage

### General Usage

```typescript
import { getSchema, getValidator } from "@nrfcloud/ts-json-schema-transformer";
import { getMockObject } from "./index";

export interface InputEvent {
  foo: Duration;
  // You can add JSDoc tags to include additional schema info
  /**
   * @format uri
   */
  other: string;
  stuff: union;
}

/**
 * @format date-time
 */
type Duration = string;

interface Type1 {
  name: "Type1";
  value: string;
}

interface Type2 {
  name: "Type2";
  /**
   * @minimum 0
   * @maximum 100
   */
  value: number;
  stuff: object;
}

// Most syntax is supported, even unions and conditional types
type union = Type1 | Type2;

// Generate a JSON schema
const schema = getSchema<InputEvent>();

// Generate an AJV validator function
const validator = getValidator<InputEvent>();

// Run the validator
validator({});

// Get the validator errors
console.log(validator.errors);

// Generate a mock object
const mock = getMockObject<InputEvent>();

// Assert method to throw errors upon validation failure
try {
  assertValid<InputEvent>(mock);
} catch (error) {
  // ... handle error
}

// TS can narrow the type after an assertValid call expression
const fn = (obj: SimpleType | string) => {
    assertValid<SimpleType>(obj);
    // We know obj is a SimpleType from this point forward
    console.log(obj.foo);
};
```

### Methods

#### `getSchema<T>(): JSONSchema7`

Generates a JSON schema for the given type.
The generic type parameter is the type you want to generate a schema for, and the single input to the function.
This function call is replaced by the generated schema at compile time.

#### `getValidator<T>(): ValidateFunction<T>`

Generates an AJV validator function for the given type.
The generic type parameter is the type you want to generate a validator for, and the single input to the function.
This function call is replaced by the generated validator at compile time.

#### `getMockObject<T, Seed>(): T`

Generate a mock object for the given type.
Should support all formats as well as other constraints.
You can optionally specify a seed for the random number generator as the second parameter.

#### `assertValid<T>(obj: unknown): asserts obj is T`

Validates that a given object satisfies the constraints defined in the given generic type parameter's schema. The method will throw an error if validation fails. This function call is replaced a wrapped validator method at compile time.

#### `assert<T>(obj: unknown): T`

Very similar to `assertValid` but returns the passed object instead of narrowing the type.

### JSDoc Tags

You can add JSDoc tags to your interfaces and types to add additional schema information.
The following tags are supported:

#### Text Tags

Inputs for these tags are parsed as text.

#### @description

Adds a description to the schema.

#### @title

Adds a title to the schema.

#### @id

Set the id property of the schema.

#### @format

Add a format validation to the schema

**Supported Formats:**

- date: full-date according to RFC3339
- time: time (time-zone is mandatory).
- date-time: date-time (time-zone is mandatory).
- duration: duration from RFC3339
- uri: full URI.
- uri-reference: URI reference, including full and relative URIs.
- uri-template: URI template according to RFC6570
- url: full URL.
- email: email address.
- hostname: host name according to RFC1034.
- ipv4: IP address v4.
- ipv6: IP address v6.
- regex: tests whether a string is a valid regular expression by passing it to RegExp constructor.
- uuid: Universally Unique IDentifier according to RFC4122.
- json-pointer: JSON-pointer according to RFC6901.
- relative-json-pointer: relative JSON-pointer according to this draft.
- byte: base64 encoded data according to the openApi 3.0.0 specification
- int32: signed 32 bits integer according to the openApi 3.0.0 specification
- int64: signed 64 bits according to the openApi 3.0.0 specification
- float: float according to the openApi 3.0.0 specification
- double: double according to the openApi 3.0.0 specification
- password: password string according to the openApi 3.0.0 specification
- binary: binary string according to the openApi 3.0.0 specification
- iso-date-time: date-time according to ISO 8601
- iso-time: time according to ISO 8601

#### @pattern

Adda a regex pattern to the schema.

#### @ref

Adds a JSON schema reference.
Not quite working yet.

#### @comment

Add a comment to the schema.

#### @contentMediaType

Sets the MIME type of the contents for a string.
[JSON Schema docs](https://json-schema.org/understanding-json-schema/reference/non_json_data.html#contentmediatype)

#### @contentEncoding

Sets the content encoding for a string.
[JSON Schema docs](https://json-schema.org/understanding-json-schema/reference/non_json_data.html#contentencoding)

#### @discriminator

Sets the discriminating property for a union type.
Maps to the `discriminator` property in the JSON schema.\
<br>

#### JSON Tags

Inputs for these tags are parsed as JSON (strings must be quoted).

#### @example

Add an example to the schema.

#### @minimum

Set the minimum value for a number.

#### @exclusiveMinimum

Set the exclusive minimum value for a number.

#### @maximum

Set the maximum value for a number.

#### @exclusiveMaximum

Set the exclusive maximum value for a number.

#### @multipleOf

Require that a number be a multiple of a given number.

#### @minLength

Set the minimum length for a string.

#### @maxLength

Set the maximum length for a string.

#### @minProperties

Set the minimum number of properties for an object.

#### @maxProperties

Set the maximum number of properties for an object.

#### @minItems

Set the minimum number of items for an array.

#### @maxItems

Set the maximum number of items for an array.

#### @uniqueItems

Require that an array only have unique items

#### @propertyNames

Set a regex pattern for additional property names.

#### @contains

Require that an array contains at least one of a given schema.

#### @const

Specify a constant value for a property.

_**NOTE: This is probably better done in typescript by setting a constant type**_

#### @examples

Provide an array of examples for a property.

#### @default

Set a default value.

#### @if

Maps to the `if` property in the JSON schema.
[JSON Schema docs](https://json-schema.org/understanding-json-schema/reference/conditionals.html#if-then-else)

#### @then

Maps to the `then` property in the JSON schema.
[JSON Schema docs](https://json-schema.org/understanding-json-schema/reference/conditionals.html#if-then-else)

#### @else

Maps to the `else` property in the JSON schema.
[JSON Schema docs](https://json-schema.org/understanding-json-schema/reference/conditionals.html#if-then-else)

#### @readOnly

Marks the property as readonly in the schema.

#### @writeOnly

Mask the property as readonly in the schema.

#### @deprecated

Marks the property as deprecated.

### Configuration

You can configure properties of schema and validator generation in the plugins config within your `tsconfig.json` file.
The validation options map to the same options in the [AJV](https://ajv.js.org/options.html) library.
The schema options map to the same options in the [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator#options) library.
Note that not all options are exposed, though more could be added in the future.

```json5
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "ts-json-schema-generator",

        // Validation options

        // Assign default values to the object passed to the validator
        "useDefaults": true,

        // Coerce properties of the validated object (ex: string to number)
        "coerceTypes": false,

        // Remove additional properties from the validated object
        "removeAdditional": false,

        // How many required properties must be present before a loop is generated.
        // Loops are slower, but generated more concise validators
        "loopRequired": 20,

        // How many enum values must be present before a loop is generated.
        "loopEnum": 100,

        // Whether to return all errors encoutered or just the first one
        "allErrors": true,

        // Schema options

        // Whether to process jsDoc annotations
        // none: Do not use JsDoc annotations.
        // basic: Read JsDoc annotations to provide schema properties.
        // extended (default): Also read @nullable, and @asType annotations.
        "jsDoc": "extended",

        // Do not allow additional items on tuples
        "strictTuples": false,

        // Whether to allow additional properties on objects that don't have index signatures
        "additionalProperties": false,
        
        // What schemas should be exposed (given readable names)
        // all: Create shared $ref definitions for all types.
        // none: Do not create shared $ref definitions.
        // export (default): Create shared $ref definitions only for exported types (not tagged as `@internal`).
        "expose": "export",
        
        // Whether properties should be sorted (stable)
        "sortProps": true,
        
        // Explicitly set the seed used for mock data generation.
        // You can disable seeding by setting this false
        "seed": "this is a seed"
      }
    ]
  }
}
```

### FAQ

#### I get the error `Not implemented. Did you forget to run the transformer?`

You need to add the transformer to you `tsconfig.json` file, or ts-patch / ttypescript are not setup correctly.
[Instructions](#Installation)

#### How do I save the schema to a file

Currently, this can only be done at runtime.
Simply call `getSchema` and run the output through `JSON.stringify` and save it to a file.

#### Where are the validation errors?

The validator function returns a boolean, and sets the `errors` property on the function to an array of errors.
[AJV Docs](https://ajv.js.org/api.html#validation-errors)

#### assertValid versus getValidator?

The key difference here from a function-standpoint is that `assertValid` is a method that will throw an error upon validation failure, and the `getValidator` method returns an AJV validator. By using `getValidator`, you can utilize and access all of the AJV validator's properties (e.g. errors, schema, etc), which may be useful for some usecases.

Frequent usage of `assertValid` may contribute to a spike in filesize in the transpiled file, this is more apparent for larger schemas.

### Contributing

Contributions are welcome!

Please follow the guidelines:

- Use conventional style commit messages
- Don't introduce any new runtime dependencies either through the index file or generated code
- Run lint and fix before committing
