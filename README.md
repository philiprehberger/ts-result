# @philiprehberger/ts-result

[![CI](https://github.com/philiprehberger/ts-result/actions/workflows/ci.yml/badge.svg)](https://github.com/philiprehberger/ts-result/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@philiprehberger/ts-result.svg)](https://www.npmjs.com/package/@philiprehberger/ts-result)
[![License](https://img.shields.io/github/license/philiprehberger/ts-result)](LICENSE)

Rust-inspired Result type for type-safe error handling without try/catch.

## Installation

```bash
npm install @philiprehberger/ts-result
```

## Usage

### Creating Results

```ts
import { ok, err, tryCatch, tryCatchAsync } from '@philiprehberger/ts-result';

const success = ok(42);
const failure = err(new Error('something broke'));

// Wrap throwing functions
const result = tryCatch(() => JSON.parse(input));
// Result<unknown, Error>

// Wrap async functions
const apiResult = await tryCatchAsync(() => fetch('/api/data'));
// Result<Response, Error>
```

### Extracting Values

```ts
result.unwrap();              // returns value or throws
result.unwrapOr('default');   // returns value or default
result.unwrapErr();           // returns error or throws
```

### Pattern Matching

```ts
result.match({
  ok: (value) => `Got: ${value}`,
  err: (error) => `Error: ${error.message}`,
});
```

### Chaining

```ts
const name = tryCatch(() => JSON.parse(input))
  .map(data => data.name)
  .map(name => name.toUpperCase())
  .unwrapOr('UNKNOWN');
```

### Error Recovery

```ts
const result = err('not found')
  .orElse(e => ok('fallback value'));
// Ok('fallback value')
```

### Side Effects

```ts
tryCatch(() => JSON.parse(input))
  .tap(data => console.log('Parsed:', data))
  .tapErr(err => console.error('Parse failed:', err))
  .map(data => data.name);
```

### Type Guards

```ts
if (result.isOk()) {
  result.value; // typed as T
}
if (result.isErr()) {
  result.error; // typed as E
}
```

### Collecting Results

```ts
import { all } from '@philiprehberger/ts-result';

const results = all([ok(1), ok(2), ok(3)]);
// Ok([1, 2, 3])

const withError = all([ok(1), err('fail'), ok(3)]);
// Err('fail') — returns first error
```

### From Promise

```ts
import { fromPromise } from '@philiprehberger/ts-result';

const result = await fromPromise(fetch('/api'));
// Result<Response, Error>
```

### To Promise

```ts
const result = ok(42);
await result.toPromise(); // resolves to 42

const failure = err(new Error('fail'));
await failure.toPromise(); // rejects with Error
```

### Filter

```ts
const result = ok(42).filter(
  (n) => n > 0,
  () => new Error('must be positive'),
);
// Ok(42)

ok(-1).filter(
  (n) => n > 0,
  () => new Error('must be positive'),
);
// Err('must be positive')
```

### Flatten

```ts
import { flatten } from '@philiprehberger/ts-result';

const nested = ok(ok(42)); // Result<Result<number, Error>, Error>
const flat = flatten(nested); // Ok(42)
```

### Custom Error Mapper

```ts
const result = tryCatch(
  () => JSON.parse(input),
  (e) => ({ code: 'PARSE_ERROR', cause: e }),
);
// Result<unknown, { code: string; cause: unknown }>

const asyncResult = await tryCatchAsync(
  () => fetch('/api'),
  (e) => new MyCustomError(e),
);
```

## License

MIT
