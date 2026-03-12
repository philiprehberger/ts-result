import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Ok, Err, ok, err, tryCatch, tryCatchAsync, fromPromise, all } from '../../dist/index.js';

describe('Ok', () => {
  it('constructs via class', () => {
    const r = new Ok(42);
    assert.equal(r.value, 42);
    assert.equal(r._tag, 'Ok');
  });

  it('constructs via factory', () => {
    const r = ok(42);
    assert.equal(r.value, 42);
    assert.equal(r._tag, 'Ok');
  });

  it('isOk returns true', () => {
    assert.equal(ok(1).isOk(), true);
  });

  it('isErr returns false', () => {
    assert.equal(ok(1).isErr(), false);
  });
});

describe('Err', () => {
  it('constructs via class', () => {
    const r = new Err('fail');
    assert.equal(r.error, 'fail');
    assert.equal(r._tag, 'Err');
  });

  it('constructs via factory', () => {
    const r = err('fail');
    assert.equal(r.error, 'fail');
    assert.equal(r._tag, 'Err');
  });

  it('isOk returns false', () => {
    assert.equal(err('x').isOk(), false);
  });

  it('isErr returns true', () => {
    assert.equal(err('x').isErr(), true);
  });
});

describe('map', () => {
  it('transforms Ok value', () => {
    const r = ok(2).map((x) => x * 3);
    assert.equal(r.unwrap(), 6);
  });

  it('is no-op on Err', () => {
    const r = err('bad').map((x) => x);
    assert.equal(r.isErr(), true);
    assert.equal(r.unwrapErr(), 'bad');
  });
});

describe('mapErr', () => {
  it('is no-op on Ok', () => {
    const r = ok(1).mapErr((e) => `wrapped: ${e}`);
    assert.equal(r.unwrap(), 1);
  });

  it('transforms Err value', () => {
    const r = err('bad').mapErr((e) => `wrapped: ${e}`);
    assert.equal(r.unwrapErr(), 'wrapped: bad');
  });
});

describe('flatMap', () => {
  it('chains Ok results', () => {
    const r = ok(2).flatMap((x) => ok(x + 1));
    assert.equal(r.unwrap(), 3);
  });

  it('short-circuits on Err', () => {
    const r = err('bad').flatMap((x) => ok(x));
    assert.equal(r.isErr(), true);
  });

  it('can return Err from Ok', () => {
    const r = ok(2).flatMap(() => err('nope'));
    assert.equal(r.isErr(), true);
    assert.equal(r.unwrapErr(), 'nope');
  });
});

describe('unwrap', () => {
  it('returns value for Ok', () => {
    assert.equal(ok(42).unwrap(), 42);
  });

  it('throws for Err with Error', () => {
    assert.throws(() => err(new Error('boom')).unwrap(), { message: 'boom' });
  });

  it('throws for Err with non-Error', () => {
    assert.throws(() => err('boom').unwrap(), { message: 'boom' });
  });
});

describe('unwrapOr', () => {
  it('returns value for Ok', () => {
    assert.equal(ok(1).unwrapOr(99), 1);
  });

  it('returns default for Err', () => {
    assert.equal(err('x').unwrapOr(99), 99);
  });
});

describe('unwrapErr', () => {
  it('returns error for Err', () => {
    assert.equal(err('e').unwrapErr(), 'e');
  });

  it('throws for Ok', () => {
    assert.throws(() => ok(1).unwrapErr(), { message: 'Called unwrapErr on Ok' });
  });
});

describe('match', () => {
  it('calls ok handler on Ok', () => {
    const r = ok(10).match({
      ok: (v) => v + 1,
      err: () => -1,
    });
    assert.equal(r, 11);
  });

  it('calls err handler on Err', () => {
    const r = err('bad').match({
      ok: () => -1,
      err: (e) => `got: ${e}`,
    });
    assert.equal(r, 'got: bad');
  });
});

describe('orElse', () => {
  it('is no-op on Ok', () => {
    const r = ok(5).orElse(() => ok(99));
    assert.equal(r.unwrap(), 5);
  });

  it('recovers from Err', () => {
    const r = err('fail').orElse(() => ok(42));
    assert.equal(r.isOk(), true);
    assert.equal(r.unwrap(), 42);
  });

  it('can produce a new Err', () => {
    const r = err('a').orElse((e) => err(`wrapped: ${e}`));
    assert.equal(r.isErr(), true);
    assert.equal(r.unwrapErr(), 'wrapped: a');
  });
});

describe('tap', () => {
  it('runs side effect on Ok', () => {
    let captured = 0;
    const r = ok(7).tap((v) => { captured = v; });
    assert.equal(captured, 7);
    assert.equal(r.unwrap(), 7);
  });

  it('is no-op on Err', () => {
    let called = false;
    const r = err('x').tap(() => { called = true; });
    assert.equal(called, false);
    assert.equal(r.isErr(), true);
  });

  it('returns this for chaining', () => {
    const original = ok(1);
    const returned = original.tap(() => {});
    assert.equal(original, returned);
  });
});

describe('tapErr', () => {
  it('is no-op on Ok', () => {
    let called = false;
    const r = ok(1).tapErr(() => { called = true; });
    assert.equal(called, false);
    assert.equal(r.unwrap(), 1);
  });

  it('runs side effect on Err', () => {
    let captured = '';
    const r = err('oops').tapErr((e) => { captured = e; });
    assert.equal(captured, 'oops');
    assert.equal(r.isErr(), true);
  });

  it('returns this for chaining', () => {
    const original = err('x');
    const returned = original.tapErr(() => {});
    assert.equal(original, returned);
  });
});

describe('tryCatch', () => {
  it('wraps successful function in Ok', () => {
    const r = tryCatch(() => 42);
    assert.equal(r.isOk(), true);
    assert.equal(r.unwrap(), 42);
  });

  it('wraps thrown Error in Err', () => {
    const r = tryCatch(() => { throw new Error('boom'); });
    assert.equal(r.isErr(), true);
    assert.equal(r.unwrapErr().message, 'boom');
  });

  it('wraps thrown non-Error in Err', () => {
    const r = tryCatch(() => { throw 'string error'; });
    assert.equal(r.isErr(), true);
    assert.equal(r.unwrapErr().message, 'string error');
  });
});

describe('tryCatchAsync', () => {
  it('wraps resolved promise in Ok', async () => {
    const r = await tryCatchAsync(async () => 100);
    assert.equal(r.isOk(), true);
    assert.equal(r.unwrap(), 100);
  });

  it('wraps rejected promise in Err', async () => {
    const r = await tryCatchAsync(async () => { throw new Error('async boom'); });
    assert.equal(r.isErr(), true);
    assert.equal(r.unwrapErr().message, 'async boom');
  });
});

describe('fromPromise', () => {
  it('wraps resolved promise in Ok', async () => {
    const r = await fromPromise(Promise.resolve('hello'));
    assert.equal(r.isOk(), true);
    assert.equal(r.unwrap(), 'hello');
  });

  it('wraps rejected promise in Err', async () => {
    const r = await fromPromise(Promise.reject(new Error('rejected')));
    assert.equal(r.isErr(), true);
    assert.equal(r.unwrapErr().message, 'rejected');
  });
});

describe('all', () => {
  it('returns Ok with all values when all Ok', () => {
    const r = all([ok(1), ok(2), ok(3)]);
    assert.equal(r.isOk(), true);
    assert.deepEqual(r.unwrap(), [1, 2, 3]);
  });

  it('returns first Err when any Err', () => {
    const r = all([ok(1), err('fail'), ok(3)]);
    assert.equal(r.isErr(), true);
    assert.equal(r.unwrapErr(), 'fail');
  });

  it('returns first Err in order', () => {
    const r = all([err('first'), err('second')]);
    assert.equal(r.isErr(), true);
    assert.equal(r.unwrapErr(), 'first');
  });

  it('handles empty array', () => {
    const r = all([]);
    assert.equal(r.isOk(), true);
    assert.deepEqual(r.unwrap(), []);
  });
});
