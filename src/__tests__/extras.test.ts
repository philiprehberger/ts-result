import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ok, err, partition, combine, all } from '../../dist/index.js';

describe('partition', () => {
  it('separates oks and errs', () => {
    const results = [ok(1), err('a'), ok(2), err('b'), ok(3)];
    const { oks, errs } = partition(results);
    assert.deepEqual(oks, [1, 2, 3]);
    assert.deepEqual(errs, ['a', 'b']);
  });

  it('handles empty input', () => {
    const { oks, errs } = partition([]);
    assert.deepEqual(oks, []);
    assert.deepEqual(errs, []);
  });

  it('handles all-ok input', () => {
    const { oks, errs } = partition([ok(1), ok(2)]);
    assert.deepEqual(oks, [1, 2]);
    assert.deepEqual(errs, []);
  });
});

describe('combine', () => {
  it('is an alias for all', () => {
    assert.equal(combine, all);
  });

  it('returns Ok when every result is Ok', () => {
    const r = combine([ok(1), ok('a'), ok(true)]);
    assert.equal(r.isOk(), true);
    assert.deepEqual(r.unwrap(), [1, 'a', true]);
  });
});

describe('mapAsync / flatMapAsync', () => {
  it('mapAsync transforms Ok via async fn', async () => {
    const r = await ok(2).mapAsync(async (v) => v * 3);
    assert.equal(r.unwrap(), 6);
  });

  it('mapAsync skips Err', async () => {
    const r = await err<string>('boom').mapAsync(async (v: number) => v * 3);
    assert.equal(r.isErr(), true);
    assert.equal(r.unwrapErr(), 'boom');
  });

  it('flatMapAsync chains async results', async () => {
    const r = await ok(2).flatMapAsync(async (v) => ok(v + 1));
    assert.equal(r.unwrap(), 3);
  });
});
