const test = require('node:test');
const assert = require('node:assert/strict');
require('../src/shared/simulation-engine.js');
const createEngine = globalThis.ThanhGioiSimulation;

test('executes one injected simulation tick and counts successful ticks', () => {
  let calls = 0;
  const engine = createEngine(() => ++calls);
  assert.equal(engine.tick(), 1);
  assert.equal(engine.tick(), 2);
  assert.equal(engine.getTickCount(), 2);
  assert.equal(engine.isTicking(), false);
});

test('does not count a failed tick and always releases the execution lock', () => {
  const engine = createEngine(() => { throw new Error('tick failed'); });
  assert.throws(() => engine.tick(), /tick failed/);
  assert.equal(engine.getTickCount(), 0);
  assert.equal(engine.isTicking(), false);
});

test('rejects a re-entrant tick', () => {
  let engine;
  engine = createEngine(() => engine.tick());
  assert.throws(() => engine.tick(), /Re-entrant/);
  assert.equal(engine.getTickCount(), 0);
  assert.equal(engine.isTicking(), false);
});

test('requires a simulation callback', () => {
  assert.throws(() => createEngine(null), /callback is required/);
});
