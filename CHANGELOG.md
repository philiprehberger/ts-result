# Changelog

## 0.3.3

- Add Development section to README
- Fix CI badge to reference publish.yml

## 0.3.0
- Add `toPromise()` method on `Ok` and `Err` to bridge Result → Promise
- Add `filter()` method on `Ok` to conditionally convert to `Err` via predicate
- Add `flatten()` utility to unwrap nested `Result<Result<T, E>, E>`
- Add `tryCatch`/`tryCatchAsync` overloads with custom error mapper `(e: unknown) => E`

## 0.2.0
- Fix `any` type casts in `all()` with proper typed assertions
- Add `orElse` method for error recovery
- Add `tap` and `tapErr` methods for side effects without breaking chains
- Add test suite (44 tests)

## 0.1.0
- Initial release
