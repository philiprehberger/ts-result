export type Result<T, E = Error> = Ok<T, E> | Err<T, E>;

export class Ok<T, E = Error> {
  readonly _tag = 'Ok' as const;
  constructor(public readonly value: T) {}

  isOk(): this is Ok<T, E> { return true; }
  isErr(): this is Err<T, E> { return false; }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Ok(fn(this.value));
  }

  mapErr<F>(_fn: (error: E) => F): Result<T, F> {
    return new Ok(this.value);
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(_defaultValue: T): T {
    return this.value;
  }

  unwrapErr(): never {
    throw new Error('Called unwrapErr on Ok');
  }

  orElse<F>(_fn: (error: E) => Result<T, F>): Result<T, F> {
    return new Ok(this.value);
  }

  tap(fn: (value: T) => void): this {
    fn(this.value);
    return this;
  }

  tapErr(_fn: (error: E) => void): this {
    return this;
  }

  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return handlers.ok(this.value);
  }

  toPromise(): Promise<T> {
    return Promise.resolve(this.value);
  }

  filter(predicate: (value: T) => boolean, errorFactory: () => E): Result<T, E> {
    return predicate(this.value) ? this : new Err(errorFactory());
  }
}

export class Err<T, E = Error> {
  readonly _tag = 'Err' as const;
  constructor(public readonly error: E) {}

  isOk(): this is Ok<T, E> { return false; }
  isErr(): this is Err<T, E> { return true; }

  map<U>(_fn: (value: T) => U): Result<U, E> {
    return new Err(this.error);
  }

  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    return new Err(fn(this.error));
  }

  flatMap<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
    return new Err(this.error);
  }

  unwrap(): never {
    throw this.error instanceof Error ? this.error : new Error(String(this.error));
  }

  unwrapOr(defaultValue: T): T {
    return defaultValue;
  }

  unwrapErr(): E {
    return this.error;
  }

  orElse<F>(fn: (error: E) => Result<T, F>): Result<T, F> {
    return fn(this.error);
  }

  tap(_fn: (value: T) => void): this {
    return this;
  }

  tapErr(fn: (error: E) => void): this {
    fn(this.error);
    return this;
  }

  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return handlers.err(this.error);
  }

  toPromise(): Promise<T> {
    return Promise.reject(this.error);
  }

  filter(_predicate: (value: T) => boolean, _errorFactory: () => E): Result<T, E> {
    return this;
  }
}

export function ok<T>(value: T): Ok<T, never> {
  return new Ok(value);
}

export function err<E>(error: E): Err<never, E> {
  return new Err(error);
}

export function tryCatch<T>(fn: () => T): Result<T, Error>;
export function tryCatch<T, E>(fn: () => T, mapError: (e: unknown) => E): Result<T, E>;
export function tryCatch<T, E = Error>(fn: () => T, mapError?: (e: unknown) => E): Result<T, E> {
  try {
    return new Ok(fn());
  } catch (error) {
    if (mapError) {
      return new Err(mapError(error));
    }
    return new Err((error instanceof Error ? error : new Error(String(error))) as unknown as E);
  }
}

export async function tryCatchAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>>;
export async function tryCatchAsync<T, E>(fn: () => Promise<T>, mapError: (e: unknown) => E): Promise<Result<T, E>>;
export async function tryCatchAsync<T, E = Error>(fn: () => Promise<T>, mapError?: (e: unknown) => E): Promise<Result<T, E>> {
  try {
    return new Ok(await fn());
  } catch (error) {
    if (mapError) {
      return new Err(mapError(error));
    }
    return new Err((error instanceof Error ? error : new Error(String(error))) as unknown as E);
  }
}

export function flatten<T, E>(result: Result<Result<T, E>, E>): Result<T, E> {
  if (result.isOk()) {
    return result.value;
  }
  return new Err(result.unwrapErr());
}

export async function fromPromise<T>(promise: Promise<T>): Promise<Result<T, Error>> {
  try {
    return new Ok(await promise);
  } catch (error) {
    return new Err(error instanceof Error ? error : new Error(String(error)));
  }
}

type AllOkValues<T extends readonly Result<unknown, unknown>[]> = {
  [K in keyof T]: T[K] extends Result<infer V, unknown> ? V : never;
};
type AllErrType<T extends readonly Result<unknown, unknown>[]> =
  T[number] extends Result<unknown, infer E> ? E : never;

export function all<T extends readonly Result<unknown, unknown>[]>(
  results: [...T],
): Result<AllOkValues<T>, AllErrType<T>> {
  const values: unknown[] = [];
  for (const result of results) {
    if (result.isErr()) {
      return new Err<AllOkValues<T>, AllErrType<T>>(result.unwrapErr() as AllErrType<T>);
    }
    values.push(result.unwrap());
  }
  return new Ok<AllOkValues<T>, AllErrType<T>>(values as AllOkValues<T>);
}
