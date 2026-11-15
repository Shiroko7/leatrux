# Temporary deepmerge security patch

This is the MIT-licensed, self-contained CommonJS build of deepmerge 4.3.1.
Its npm tarball was verified against the SHA-512 integrity in the original lockfile.

GHSA-gcqx-w48m-w2h4 has no upstream patched release. Both target and source
properties now use `Object.defineProperty` instead of assignment when constructing
the merged object. An own `__proto__` data property can no longer invoke the
inherited setter and change the result's prototype. Other merge behavior is kept.

The root npm override routes the Svelte Vite plugin to this private local package.
Run `npm run test:security` to verify the installed dependency, including poisoned
target objects, nested merges, and custom array merging. Remove this override when
the upstream dependency has a verified fix.

Advisory: https://github.com/advisories/GHSA-gcqx-w48m-w2h4
Upstream: https://github.com/TehShrike/deepmerge/tree/v4.3.1
