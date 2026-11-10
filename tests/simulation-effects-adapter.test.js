const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const root = require('node:path').join(__dirname, '../src/client/simulation-effects-adapter.js');
const context = {};
vm.runInNewContext(fs.readFileSync(root, 'utf8'), context);
const createAdapter = context.ThanhGioiSimulationEffectsAdapter;
const listeners = new Set();
const effects = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  emit(effect) {
    for (const listener of [...listeners]) listener(effect);
  }
};
const seen = [];
const adapter = createAdapter({
  effects,
  handlers: {
    notification: effect => seen.push(['notification', effect.html]),
    'ideology-choice-required': effect => seen.push(['ideology', effect.options[0].id]),
    'roleplay-game-over': effect => seen.push(['game-over', effect.message])
  }
});
effects.emit({ type: 'notification', html: 'chronicle' });
effects.emit({ type: 'ideology-choice-required', options: [{ id: 'rep' }] });
effects.emit({ type: 'roleplay-game-over', message: 'ended' });
effects.emit({ type: 'unhandled' });
assert.deepEqual(seen, [
  ['notification', 'chronicle'],
  ['ideology', 'rep'],
  ['game-over', 'ended']
]);
assert.equal(listeners.size, 1);
adapter.dispose();
adapter.dispose();
assert.equal(adapter.isDisposed(), true);
assert.equal(listeners.size, 0);
effects.emit({ type: 'notification', html: 'after dispose' });
assert.equal(seen.length, 3);
assert.throws(() => createAdapter({ handlers: {} }), /bus/);
console.log('simulation-effects-adapter tests passed');
