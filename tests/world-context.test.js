const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/shared/world-context.js'), 'utf8');
const context = {};
vm.runInNewContext(source, context);
const world = context.ThanhGioiWorldContext();
assert.equal(world.isAttached(), false);
assert.throws(() => world.getState(), /not been attached/);
const state = {
  n: 2, c: 10, cfg: {}, T: new Uint8Array(4), O: new Uint16Array(4),
  X: new Uint8Array(4), RV: new Uint8Array(4), W: { ks: [] },
  CD: {}, BL: [], RD: []
};
assert.equal(world.attach(state), 1);
assert.equal(world.isAttached(), true);
assert.equal(world.getState(), state);
assert.equal(world.read('W'), state.W);
const nextW = { ks: [{ id: 1 }] };
assert.equal(world.write('W', nextW), 2);
assert.equal(world.read('W'), nextW);
assert.equal(world.getRevision(), 2);
assert.throws(() => world.attach({}), /missing/);
assert.throws(() => world.attach({ ...state, n: 3 }), /dimensions/);
assert.throws(() => world.read('missing'), /Unknown/);
assert.throws(() => world.write('missing', 1), /Unknown/);
console.log('world-context tests passed');
