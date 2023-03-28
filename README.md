# ts-json-schema-transformer

**A TypeScript transformer that generates JSON schemas and validators from TypeScript interfaces**

## Description

This package provides a TypeScript transformer that generates JSON schemas and validators from TypeScript interfaces.
It uses [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator) to introspect types and
[ajv](https://github.com/ajv-validator/ajv) to generate validator functions. Functions and schema are generated inline
at compile time using a custom typescript transformer.

## Installation

#### Requirements

- typescript >=4.9.x < 5

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
# OR
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
 * @format date_time
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

// Geneerate a JSON schema
const schema = getSchema<InputEvent>();

// Generate an AJV validator function
const validator = getValidator<InputEvent>();

// Run the validator
validator({});

// Get the validator errors
console.log(validator.errors);
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
- date_time: date-time (time-zone is mandatory).
- duration: duration from RFC3339
- uri: full URI.
- uri_reference: URI reference, including full and relative URIs.
- uri_template: URI template according to RFC6570
- email: email address.
- hostname: host name according to RFC1034.
- ipv4: IP address v4.
- ipv6: IP address v6.
- regex: tests whether a string is a valid regular expression by passing it to RegExp constructor.
- uuid: Universally Unique IDentifier according to RFC4122.
- json_pointer: JSON-pointer according to RFC6901.
- relative_json_pointer: relative JSON-pointer according to this draft.
- byte: base64 encoded data according to the openApi 3.0.0 specification
- int32: signed 32 bits integer according to the openApi 3.0.0 specification
- int64: signed 64 bits according to the openApi 3.0.0 specification
- float: float according to the openApi 3.0.0 specification
- double: double according to the openApi 3.0.0 specification
- password: password string according to the openApi 3.0.0 specification
- binary: binary string according to the openApi 3.0.0 specification

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

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "ts-json-schema-generator",

        // Validation options

        // Assign default values to the object passed to the validator
        "useDefaults": true,

        // Coerce properties of the validated object (ex: string to number)
        "coerceTypes": true,

        // Remove additional properties from the validated object
        "removeAdditional": false,

        // How many required properties must be present before a loop is generated.
        // Loops are slower, but generated more concise validators
        "loopRequired": 20,

        // How many enum values must be present before a loop is generated.
        "loopEnum": 100,

        // Whether or not to return all errors encoutered or just the first one
        "allErrors": true,

        // Schema options

        // Whether or not to process jsDoc annotations
        "jsDoc": "extended",

        // Do not allow additional items on tuples
        "strictTuples": false,

        // Whether or not to allow additional properties on objects that don't have index signatures
        "additionalProperties": false
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

### Contributing

Contributions are welcome!

Please follow the guidelines:

- Use conventional style commit messages
- Don't introduce any new runtime dependencies either through the index file or generated code
- Run lint and fix before committing
