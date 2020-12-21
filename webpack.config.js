const path = require("path");

const { ESBuildPlugin, ESBuildMinifyPlugin } = require("esbuild-loader");
const { DefinePlugin, ProgressPlugin } = require("webpack");
const nodeExternals = require("webpack-node-externals");

const PrerenderPlugin = require("./webpack/prerender-plugin");
const prerenderExternals = require("./webpack/prerender-externals");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const paths = ["/", "/about", "404.html"];

/** @typedef {import("webpack").Configuration} Configuration */

function cssRules(ssr = false) {
  return [
    {
      include: /\.module\.css$/,
      use: ssr
        ? {
            loader: "css-loader",
            options: {
              modules: { exportOnlyLocals: true },
            },
          }
        : [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                modules: true,
              },
            },
          ],
    },
  ];
}

/** @type {Configuration} */
const baseConfig = {
  devtool: "source-map",
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
    new ProgressPlugin(),
    new ESBuildPlugin(),
    new MiniCssExtractPlugin({
      filename: "styles.css",
    }),
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
  module: {
    ...baseConfig.module,
    rules: [...baseConfig.module.rules, ...cssRules()],
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
  module: {
    ...baseConfig.module,
    rules: [...baseConfig.module.rules, ...cssRules(true)],
  },
  externals: [prerenderExternals()],
  plugins: [
    ...baseConfig.plugins,
    new PrerenderPlugin({
      publicPath: process.env.PUBLIC_PATH,
      paths,
    }),
  ],
};

module.exports = [clientConfig, serverConfig];
