# @philiprehberger/result

[![CI](https://github.com/philiprehberger/ts-result/actions/workflows/ci.yml/badge.svg)](https://github.com/philiprehberger/ts-result/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@philiprehberger/result.svg)](https://www.npmjs.com/package/@philiprehberger/result)
[![License](https://img.shields.io/github/license/philiprehberger/ts-result)](LICENSE)

Rust-inspired Result type for type-safe error handling without try/catch

## Installation

```bash
npm install @philiprehberger/result
```

## Usage

### Creating Results

```ts
import { ok, err, tryCatch, tryCatchAsync } from '@philiprehberger/result';

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
import { all } from '@philiprehberger/result';

const results = all([ok(1), ok(2), ok(3)]);
// Ok([1, 2, 3])

const withError = all([ok(1), err('fail'), ok(3)]);
// Err('fail') — returns first error
```

### From Promise

```ts
import { fromPromise } from '@philiprehberger/result';

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
import { flatten } from '@philiprehberger/result';

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


## API

### Factory Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `ok(value)` | `Ok<T>` | Create a success result |
| `err(error)` | `Err<E>` | Create a failure result |
| `tryCatch(fn, mapError?)` | `Result<T, E>` | Wrap a throwing function |
| `tryCatchAsync(fn, mapError?)` | `Promise<Result<T, E>>` | Wrap an async throwing function |
| `fromPromise(promise)` | `Promise<Result<T, Error>>` | Convert a promise to a Result |
| `all(results)` | `Result<T[], E>` | Collect an array of Results; returns first error |
| `flatten(result)` | `Result<T, E>` | Unwrap a nested `Result<Result<T, E>, E>` |

### Result Instance Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `isOk()` | `boolean` | Type guard for Ok |
| `isErr()` | `boolean` | Type guard for Err |
| `map(fn)` | `Result<U, E>` | Transform the success value |
| `mapErr(fn)` | `Result<T, F>` | Transform the error value |
| `flatMap(fn)` | `Result<U, E>` | Chain with a Result-returning function |
| `unwrap()` | `T` | Extract value or throw |
| `unwrapOr(default)` | `T` | Extract value or return default |
| `unwrapErr()` | `E` | Extract error or throw |
| `orElse(fn)` | `Result<T, F>` | Recover from an error |
| `tap(fn)` | `this` | Side effect on success value |
| `tapErr(fn)` | `this` | Side effect on error value |
| `match({ ok, err })` | `U` | Pattern match on Ok/Err |
| `toPromise()` | `Promise<T>` | Convert to a Promise |
| `filter(predicate, errorFactory)` | `Result<T, E>` | Keep Ok if predicate passes, else Err |

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT
