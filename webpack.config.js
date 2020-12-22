const fs = require("fs");
const path = require("path");

const { ESBuildPlugin, ESBuildMinifyPlugin } = require("esbuild-loader");
const { DefinePlugin, ProgressPlugin } = require("webpack");
const nodeExternals = require("webpack-node-externals");
const { StatsWriterPlugin } = require("webpack-stats-plugin");

const PrerenderPlugin = require("./webpack/prerender-plugin");
const prerenderExternals = require("./webpack/prerender-externals");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const prerenderRules = require("./webpack/prerender-rules");

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
    alias: {
      "preact-webpack-prerender/useStaticResult": path.resolve(
        __dirname,
        "webpack/useStaticResult.js"
      ),
    },
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
    rules: [...cssRules(), ...prerenderRules()],
  },
  plugins: [
    ...baseConfig.plugins,
    {
      /** @param {import("webpack").Compiler} compiler */
      apply(compiler) {
        compiler.hooks.beforeCompile.tapPromise(
          "REMOVE STATS",
          async (options) => {
            const p = path.resolve(process.cwd(), "public/static/stats.json");
            if (fs.existsSync(p)) await fs.promises.unlink(p);

            return options;
          }
        );
      },
    },
    new StatsWriterPlugin({
      stats: {
        all: true,
        // assets: false,
        // chunks: true,
        modules: true,
      },
    }),
  ],
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
    rules: [...cssRules(true), ...prerenderRules(true)],
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
