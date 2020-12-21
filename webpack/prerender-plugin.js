const fs = require("fs");
const path = require("path");

const { minify } = require("html-minifier-terser");
const webpack = require("webpack");

const PLUGIN_NAME = "PrerenderPlugin";

const hoofdStringify = (title, metas, links, ampScript) => {
  const visited = new Set();
  return `
    <title>${title}</title>

    ${
      ampScript
        ? `<script src={ampScript} async ${
            ampScript.endsWith("mjs") ? 'type="module"' : ""
          } />`
        : ""
    }

    ${metas.reduce((acc, meta) => {
      if (!visited.has(meta.charset ? meta.keyword : meta[meta.keyword])) {
        visited.add(meta.charset ? meta.keyword : meta[meta.keyword]);
        return `${acc}<meta ${meta.keyword}="${meta[meta.keyword]}"${
          meta.charset ? "" : ` content="${meta.content}"`
        }>`;
      }
      return acc;
    }, "")}

    ${links.reduce((acc, link) => {
      return `${acc}<link${Object.keys(link).reduce(
        (properties, key) => `${properties} ${key}="${link[key]}"`,
        ""
      )}>`;
    }, "")}
  `;
};

function renderPreload(preload, publicPath) {
  return preload.map(
    (p) =>
      `<link rel="preload" as="${
        p.endsWith(".js") ? "script" : "style"
      }" href="${publicPath}/static/${p}" />`
  );
}

async function prerenderRoute(compilation, p, publicPath, timestamp) {
  const { LocationProvider } = require(path.join(
    process.cwd(),
    "dist/preact-iso/router"
  ));
  const { toStatic } = require("hoofd/preact");
  const { h } = require("preact");
  const prerender = require("./prerender");

  const appPath = path.resolve(compilation.outputOptions.path, "main.js");

  const App = require(appPath).default;

  const app = h(LocationProvider.ctx.Provider, { value: { path: p } }, h(App));

  const rendered = await prerender(app);
  const { metas, links, title, lang, amp, ampScript } = toStatic();
  const hoofdStringified = hoofdStringify(title, metas, links, ampScript);

  const html = minify(
    `<!doctype html>
<html ${lang ? `lang="${lang}"` : ""} ${amp ? `amp` : ""}>
  <head>
    ${hoofdStringified}
    <link rel="stylesheet" href="${publicPath}/static/styles.css?ts=${timestamp}" />
    ${renderPreload(rendered.preload, publicPath)}
  </head>
  <body>${rendered.html}
    <script src="${publicPath}/static/main.js?ts=${timestamp}"></script>
  </body>
</html>`,
    {
      collapseWhitespace: true,
      collapseInlineTagWhitespace: true,
      removeComments: true,
    }
  );

  return html;
}

/**
 * @typedef {object} PreactPrerenderPluginOptions
 * @property {string} dir
 * @property {string[]} paths
 */

class PrerenderPlugin {
  /**
   *
   * @param {PreactPrerenderPluginOptions} options
   */
  constructor(options) {
    options = options || {};
    this._dir = options.dir || path.resolve(process.cwd(), "public");
    this._paths = options.paths || ["/"];
    this._publicPath = options.publicPath || "";
  }

  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler) {
    compiler.hooks.afterEmit.tapPromise(PLUGIN_NAME, async (compilation) => {
      await fs.promises.mkdir(this._dir, { recursive: true });
      const timestamp = Date.now();

      const distDir = path.resolve(this._dir);
      for (const key of Object.keys(require.cache)) {
        if (!key.includes("node_modules")) {
          delete require.cache[key];
        }
      }

      for (const p of this._paths) {
        const html = await prerenderRoute(
          compilation,
          p,
          this._publicPath,
          timestamp
        );

        const pp = p.startsWith("/") ? p.slice(1) : p;
        let filename = path.resolve(this._dir, pp);
        if (!pp.endsWith(".html")) {
          await fs.promises.mkdir(filename, { recursive: true });

          filename = path.resolve(filename, "index.html");
        }

        await fs.promises.writeFile(filename, html, "utf-8");
      }
    });
  }
}

module.exports = PrerenderPlugin;
