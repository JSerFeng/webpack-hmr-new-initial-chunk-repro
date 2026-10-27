# HMR does not load a newly introduced initial JS dependency

Standalone reproduction with **unmodified webpack 5.112.2**, Node.js 22 or newer. No Rspack patches, runtime monkey-patching, dev server, framework, or browser reload fallback.

## Run

```sh
npm ci
npm test
npm run test:control
```

`npm test` asserts the desired behavior and is expected to **exit 1 on the affected version**. The control is expected to exit 0. Each invocation recreates only the gitignored `.work/` directory; tracked source files are unchanged.

## Scenario

Initially, `page.js` runs in the entry chunk and sets `app.value` to 1. Edit it to synchronously require `dep.js`. An explicit splitChunks cache group places dep in a new initial `shared` chunk. Applying HMR must make dep available before page self-accepts.

The starting files are in [src](src); [steps](steps) contains the exact edits. [reproduce.cjs](reproduce.cjs) performs those edits and applies HMR. The small [harness](harness.cjs) uses webpack's public Node API, persisting compilation records between successive builds, then executes webpack's real emitted runtime.

## Actual and expected behavior

The update manifest does not include or arrange loading of the new shared dependency. Re-executing page fails with `Cannot find module './dep.js'`. This is distinct from copying an updated, moved module into its former hot-update chunk.

The assertions express the expected result. See [observed.json](observed.json) for the captured failing run and [control.json](control.json) for its successful control. Generated chunks and update files are left in `.work/dist/`; each run also writes `results/last-run.json` with the compilation hashes, chunk/module membership, manifests, and result.

## Control

Disable splitChunks. The new factory stays in the existing update chunk, and the same edit succeeds.

## Scope

Verified on 2026-10-28. HMR compiler and JavaScript HMR runtime files in the npm release match webpack main commit `bd8eddff945733f65ada91ad441ce8b613f1544a` byte-for-byte. This is **not** a claim that every file or target on main was tested.

Related: [webpack #19494](https://github.com/webpack/webpack/pull/19494). Handling updated modules that move out of an old chunk does not by itself supply every newly required initial dependency.
