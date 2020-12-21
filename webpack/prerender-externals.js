const path = require("path");

function prerenderExternals() {
  return {
    preact: "preact/dist/preact.js",
    "preact/hooks": "preact/hooks/dist/hooks.js",
    "hoofd/preact": "hoofd/preact",
    "preact-iso": path.resolve(process.cwd(), "dist/preact-iso/index.js"),
    "preact-iso/lazy": path.resolve(__dirname, "lazy.js"),
    "preact-iso/router": path.resolve(
      process.cwd(),
      "dist/preact-iso/router.js"
    ),
  };
}

module.exports = prerenderExternals;
