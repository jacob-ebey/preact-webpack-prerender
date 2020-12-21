const fs = require("fs");
const path = require("path");

const webpack = require("webpack");

const PLUGIN_NAME = "PreactPrerenderPlugin";

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

async function prerenderRoute(compilation, p, timestamp) {
  const appPath = path.resolve(compilation.outputOptions.path, "main.js");

  const { h } = require("preact");
  const prerender = require("./prerender");
  const { LocationProvider } = require("../dist/preact-iso/router");
  const { toStatic } = require("hoofd/preact");

  const App = require(appPath).default;

  const app = h(LocationProvider.ctx.Provider, { value: { path: p } }, h(App));

  const rendered = await prerender(app);
  const { metas, links, title, lang, amp, ampScript } = toStatic();
  const hoofdStringified = hoofdStringify(title, metas, links, ampScript);

  const html = `<!doctype html>
<html ${lang ? `lang="${lang}"` : ""} ${amp ? `amp` : ""}>
  <head>
    ${hoofdStringified}
  </head>
  <body>${rendered}
    <script src="/static/main.js?ts=${timestamp}"></script>
  </body>
</html>`;

  return html;
}

/**
 * @typedef {object} PreactPrerenderPluginOptions
 * @property {string} dir
 * @property {string[]} paths
 */

class PreactPrerenderPlugin {
  /**
   *
   * @param {PreactPrerenderPluginOptions} options
   */
  constructor(options) {
    options = options || {};
    this._dir = options.dir || path.resolve(process.cwd(), "public");
    this._paths = options.paths || ["/"];
  }

  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler) {
    compiler.hooks.afterEmit.tapPromise(PLUGIN_NAME, async (compilation) => {
      const timestamp = Date.now();

      for (const p of this._paths) {
        const html = await prerenderRoute(compilation, p, timestamp);

        const pp = p.startsWith("/") ? p.slice(1) : p;
        const dir = path.resolve(this._dir, pp);
        const filename = path.resolve(dir, "index.html");

        await fs.promises.mkdir(dir, { recursive: true });
        await fs.promises.writeFile(filename, html, "utf-8");
      }
    });
  }
}

module.exports = PreactPrerenderPlugin;
