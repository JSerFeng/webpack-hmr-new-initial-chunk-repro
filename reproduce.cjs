const assert = require("node:assert/strict");
const { setup } = require("./harness.cjs");
const config = require("./webpack.config.cjs");
const control = process.argv.includes("--control");
if (control) config.optimization.splitChunks = false;
const h = setup(config);

(async () => {
  try {
    await h.start();
    h.edit(1); await h.compile("add initial dependency");
    const update = await h.update();
    h.save({ control, update, actual: app.value, expected: 2 });
    assert.equal(update.error, undefined);
    assert.equal(app.value, 2);
  } finally { await h.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
