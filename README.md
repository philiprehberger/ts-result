# @philiprehberger/ts-result

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

## License

MIT
