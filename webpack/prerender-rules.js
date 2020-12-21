const path = require("path");

function prerenderRules(ssr = false) {
  const esbuildLoader = {
    loader: "esbuild-loader",
    options: {
      loader: "jsx",
      target: "es2015",
      jsxFactory: "h",
      jsxFragment: "Fragment",
    },
  };

  return [
    { test: /\.m?js/, type: "javascript/auto" },
    {
      include: /\.jsx?/,
      use: ssr
        ? [path.resolve(__dirname, "lazy-loader.js"), esbuildLoader]
        : esbuildLoader,
    },
  ];
}

module.exports = prerenderRules;
