const path = require("path");

const { ESBuildPlugin, ESBuildMinifyPlugin } = require("esbuild-loader");
const { DefinePlugin } = require("webpack");
const nodeExternals = require("webpack-node-externals");

const PreactPrerenderPlugin = require("./webpack/prerender-plugin");

const paths = ["/", "/about"];

/** @typedef {import("webpack").Configuration} Configuration */

/** @type {Configuration} */
const baseConfig = {
  resolve: {
    extensions: [".js", ".jsx"],
  },
  optimization: {
    minimizer: [
      new ESBuildMinifyPlugin({
        target: "es2015",
      }),
    ],
  },
  plugins: [
    new ESBuildPlugin(),
    new DefinePlugin({
      PUBLIC_PATH: JSON.stringify(process.env.PUBLIC_PATH || null),
    }),
  ],
  module: {
    rules: [
      { test: /\.m?js/, type: "javascript/auto" },
      {
        include: /\.jsx?/,
        use: {
          loader: "esbuild-loader",
          options: {
            loader: "jsx",
            target: "es2015",
            jsxFactory: "h",
            jsxFragment: "Fragment",
          },
        },
      },
    ],
  },
};

/** @type {Configuration} */
const clientConfig = {
  ...baseConfig,
  entry: "./src/index.jsx",
  output: {
    path: path.resolve(__dirname, "public/static"),
    chunkFilename: "[name].[contenthash].js",
    assetModuleFilename: "[name].[contenthash][ext][query]",
  },
};

/** @type {Configuration} */
const serverConfig = {
  ...baseConfig,
  target: "node",
  entry: "./src/app.jsx",
  output: {
    path: path.resolve(__dirname, "dist/prerender"),
    library: { type: "commonjs" },
  },
  externals: [
    {
      preact: "preact/dist/preact.js",
      "preact/hooks": "preact/hooks/dist/hooks.js",
      "hoofd/preact": "hoofd/preact",
      "preact-iso": path.resolve(process.cwd(), "dist/preact-iso/index.js"),
      "preact-iso/lazy": path.resolve(process.cwd(), "dist/preact-iso/lazy.js"),
      "preact-iso/router": path.resolve(
        process.cwd(),
        "dist/preact-iso/router.js"
      ),
    },
  ],
  plugins: [
    ...baseConfig.plugins,
    new PreactPrerenderPlugin({
      publicPath: process.env.PUBLIC_PATH,
      paths,
    }),
  ],
};

module.exports = [clientConfig, serverConfig];
