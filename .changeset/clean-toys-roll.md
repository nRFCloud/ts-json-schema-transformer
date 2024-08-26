---
"@nrfcloud/ts-json-schema-transformer": major
---

Added several new helper methods

* `assert` - Asserts that a value is valid while returning the value
* `createAssertFn` - Creates a function that asserts that a value is valid
* `parse` - Parses a value and return undefined if it is invalid
* `createParseFn` - Creates a function that parses a value and returns undefined if it is invalid
* `assertParse` - Parses a value and asserts that it is valid
* `createAssertParseFn` - Creates a function that parses a value and asserts that it is valid
* `createMockFn` - Creates a function that generates a mock value
* `createAssertGuardFn` - Creates a function that asserts that a value is valid, narrowing the type
* `guard` - Validates a value and narrows the type (type guard)
* `validate` - Validates a value and returns the value if it is valid or undefined if it is invalid
* `createValidateFn` - Creates a function that validates a value and returns the value if it is valid or undefined if it is invalid

A few methods have been renamed, and their previous names are now deprecated:
* `assertValid` -> `assertGuard`
* `getMockObject` -> `mock`
* `getValidator` -> `createGuardFn`
