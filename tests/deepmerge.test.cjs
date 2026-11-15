const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const test = require('node:test');

// Resolve the same dependency that the Svelte Vite plugin actually loads.
const pluginRequire = createRequire(require.resolve('@sveltejs/vite-plugin-svelte'));
const merge = pluginRequire('deepmerge');

test('poisoned target and source objects never alter the returned prototype', () => {
  const poison = JSON.parse('{"__proto__":{"isAdmin":true}}');
  for (const result of [merge(poison, {}), merge(poison, poison), merge({}, poison)]) {
    assert.equal(Object.getPrototypeOf(result), Object.prototype);
    assert.equal(result.isAdmin, undefined);
    assert.equal({}.isAdmin, undefined);
  }
});

test('nested poisoned properties remain data and cannot become inherited values', () => {
  const target = JSON.parse('{"nested":{"__proto__":{"isAdmin":true},"safe":1}}');
  const result = merge(target, { nested: { other: 2 } });
  assert.equal(Object.getPrototypeOf(result.nested), Object.prototype);
  assert.equal(result.nested.isAdmin, undefined);
  assert.equal(result.nested.safe, 1);
  assert.equal(result.nested.other, 2);
});

test('configuration objects, arrays and custom merging retain their behavior', () => {
  const target = { compiler: { dev: true }, extensions: ['.svelte'] };
  const result = merge(target, { compiler: { css: 'external' }, extensions: ['.svx'] });
  assert.deepEqual(result, {
    compiler: { dev: true, css: 'external' }, extensions: ['.svelte', '.svx']
  });
  assert.deepEqual(target, { compiler: { dev: true }, extensions: ['.svelte'] });
  assert.deepEqual(merge.all([{ a: 1 }, { b: 2 }]), { a: 1, b: 2 });
  assert.deepEqual(merge({ a: [1] }, { a: [2] }, {
    arrayMerge: (_target, source) => source
  }), { a: [2] });
});
