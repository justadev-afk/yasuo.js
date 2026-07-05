import { defineConfig } from 'tsup'

/**
 * Bundles the library into `dist/` as both ESM (`index.js`) and CommonJS
 * (`index.cjs`) plus a rolled-up `index.d.ts`.
 *
 * Yasuo ships with **zero runtime dependencies** (it only uses the platform's
 * native `fetch`), so there is nothing to mark external. Tree-shaking and
 * minification keep the published bundle as small as possible.
 *
 * tsup emits one declaration file per JS format — `index.d.ts` for ESM and a
 * byte-identical `index.d.cts` for CJS. Type declarations dominate the tarball
 * (~70%), so we drop the duplicate and let both the `import` and `require`
 * conditions in `package.json#exports` resolve to the single `index.d.ts`. This
 * removes ~36 kB gzipped (~35% of the published package) with **zero** loss of
 * type information or JSDoc. The duplicate `index.d.cts` is deleted by the
 * `build` npm script *after* tsup exits — tsup's `onSuccess` hook races the
 * declaration worker and cannot delete it reliably.
 */
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  target: 'node18',
  dts: true,
  clean: true,
  minify: true,
  treeshake: true,
  sourcemap: false,
  splitting: false,
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' }
  },
})
