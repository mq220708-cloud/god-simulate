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
state.W.ks.push({ id: 1, name: 'Test' });
assert.equal(world.getKingdom(1), state.W.ks[0]);
assert.equal(world.getKingdom(0), undefined);
assert.equal(world.getKingdom('invalid'), undefined);
assert.equal(world.getKingdoms(), state.W.ks);
assert.deepEqual(Array.from(world.getLivingKingdoms(), k => k.id), [1]);
state.W.ks.push({ id: 2, alive: 0 });
assert.deepEqual(Array.from(world.getLivingKingdoms(), k => k.id), [1]);
const nextW = { ks: [{ id: 1 }] };
assert.equal(world.write('W', nextW), 2);
assert.equal(world.read('W'), nextW);
assert.equal(world.getRevision(), 2);
assert.throws(() => world.attach({}), /missing/);
assert.throws(() => world.attach({ ...state, n: 3 }), /dimensions/);
assert.throws(() => world.read('missing'), /Unknown/);
assert.throws(() => world.write('missing', 1), /Unknown/);
console.log('world-context tests passed');
