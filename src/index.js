globalThis.app ||= {};
app.hot = module.hot;
app.hash = () => __webpack_hash__;
require('./page');
module.hot.accept();
