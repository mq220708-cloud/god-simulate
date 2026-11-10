const test = require('node:test');
const assert = require('node:assert/strict');
require('../src/shared/world-state.js');
const codec = globalThis.ThanhGioiWorldState;

const sample = () => ({
  T: [0, 1, 2, 3], O: [0, 0, 1, 1], n: 2,
  W: { year: 3, month: 4, ks: [{ id: 1 }] }
});

test('serializes and restores a versioned world snapshot', () => {
  const saved = codec.serialize(sample());
  assert.equal(saved.format, 'than-gioi-world');
  assert.equal(saved.schemaVersion, 1);
  assert.deepEqual(codec.deserialize(JSON.parse(JSON.stringify(saved))), sample());
});

test('continues to read legacy v1.6.x save objects', () => {
  assert.deepEqual(codec.deserialize(sample()), sample());
});

test('rejects invalid map dimensions', () => {
  assert.throws(() => codec.serialize({ ...sample(), n: 3 }), /dimensions/);
});

test('rejects saves from a newer schema version', () => {
  assert.throws(() => codec.deserialize({
    format: 'than-gioi-world', schemaVersion: 2, state: sample()
  }), /newer version/);
});
