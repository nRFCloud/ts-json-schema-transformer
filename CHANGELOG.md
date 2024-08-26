# @nrfcloud/ts-json-schema-transformer

## 3.0.0

### Major Changes

- b32e2cc: Added several new helper methods

  - `assert` - Asserts that a value is valid while returning the value
  - `createAssertFn` - Creates a function that asserts that a value is valid
  - `parse` - Parses a value and return undefined if it is invalid
  - `createParseFn` - Creates a function that parses a value and returns undefined if it is invalid
  - `assertParse` - Parses a value and asserts that it is valid
  - `createAssertParseFn` - Creates a function that parses a value and asserts that it is valid
  - `createMockFn` - Creates a function that generates a mock value
  - `createAssertGuardFn` - Creates a function that asserts that a value is valid, narrowing the type
  - `guard` - Validates a value and narrows the type (type guard)
  - `validate` - Validates a value and returns the value if it is valid or undefined if it is invalid
  - `createValidateFn` - Creates a function that validates a value and returns the value if it is valid or undefined if it is invalid

  A few methods have been renamed, and their previous names are now deprecated:

  - `assertValid` -> `assertGuard`
  - `getMockObject` -> `mock`
  - `getValidator` -> `createGuardFn`

### Minor Changes

- b32e2cc: seeded mock

## 2.1.0

### Minor Changes

- 076fec7: seeded mock

## 2.0.1

### Patch Changes

- 5f2341c: disable ajv strict

## 2.0.0

### Major Changes

- 763d69e: Update TS to 5.5

  BREAKING: TS 5.5 is now required

## 1.4.2

### Patch Changes

- 41ed7c6: Automatically add AJV errors to ValidationError.cause.

## 1.4.1

### Patch Changes

- 70948df: fix bug with negative numeric literals

## 1.4.0

### Minor Changes

- d00a70e: update typescript

## 1.3.0

### Minor Changes

- f7b6c73: update to ts 5.3

### Patch Changes

- d46b75b: upgrade packages

## 1.2.5

### Patch Changes

- bbb411d: Generic error object replaced with ValidationError for assertValid

## 1.2.4

### Patch Changes

- 4371654: update dependencies

## 1.2.3

### Patch Changes

- f1bd3de: prevent transformer from removing source refs

## 1.2.2

### Patch Changes

- 29cb6ec: handle missing source files

## 1.2.1

### Patch Changes

- bdf655b: update release process to changesets
