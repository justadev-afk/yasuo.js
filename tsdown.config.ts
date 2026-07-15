import { defineConfig } from 'tsdown'

/**
 * Bundles the library into `dist/` as both ESM (`index.js`) and CommonJS
 * (`index.cjs`) plus a rolled-up `index.d.ts`.
 *
 * Yasuo ships with **zero runtime dependencies** (it only uses the platform's
 * native `fetch`), so there is nothing to mark external. Tree-shaking and
 * minification keep the published bundle as small as possible.
 *
 * **Why tsdown and not tsup.** TypeScript 7 is the native (Go) compiler and
 * ships no stable JS compiler API, which tsup's `dts: true` needs — it rolls
 * declarations up with `rollup-plugin-dts`, which reads `ts.sys` at module
 * scope and crashes. tsdown's dts generator drives the TS7 binary directly
 * (`tsgo`), so it needs neither the JS API nor `isolatedDeclarations`. See
 * `docs/architecture.md` for the full rationale and the known caveats.
 *
 * **`outExtensions` pins the emitted names.** tsdown would otherwise emit
 * `index.mjs`/`index.d.mts`; we keep tsup's names so `package.json#exports`
 * stays untouched and published consumers see no change.
 *
 * One declaration file per JS format is emitted — `index.d.ts` for ESM and a
 * byte-identical `index.d.cts` for CJS. Type declarations dominate the tarball
 * (~70%), so we drop the duplicate and let both the `import` and `require`
 * conditions in `package.json#exports` resolve to the single `index.d.ts`. This
 * removes ~36 kB gzipped (~35% of the published package) with **zero** loss of
 * type information or JSDoc. The duplicate `index.d.cts` is deleted by the
 * `build` npm script *after* tsdown exits.
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
  outExtensions({ format }) {
    return format === 'cjs' ? { js: '.cjs', dts: '.d.cts' } : { js: '.js', dts: '.d.ts' }
  },
})
