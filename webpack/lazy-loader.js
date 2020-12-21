const fs = require("fs");
const path = require("path");

function findModulesForImportPath(modules, importPath) {
  const mods = [];
  for (const mod of modules || []) {
    if (
      mod &&
      mod.reasons &&
      mod.reasons.some((reason) => reason && reason.userRequest === importPath)
    ) {
      mods.push(mod);
    }

    if (mod && mod.children) {
      mods.push(...findModulesForImportPath(mod.children));
    }
  }

  return mods;
}

/**
 * @param {string} source
 */
function lazyLoader(source) {
  const done = this.async();
  // TODO: Get chunks from stats and add to preload array

  const stats = JSON.parse(
    fs
      .readFileSync(
        path.resolve(process.cwd(), "public/static/stats.json"),
        "utf-8"
      )
      .toString()
  );

  const replaced = source.replace(
    /\)\s{0,}=>\s{0,}(import\s{0,}\([\'|\"](.*)[\'|\"]\s{0,}\))/g,
    (substring, ...args) => {
      const [dynamicImport, importPath] = args;

      const preload = new Set();
      for (const chunk of stats.chunks) {
        if (chunk.modules && chunk.files) {
          const mods = findModulesForImportPath(chunk.modules, importPath);
          if (mods.length > 0) {
            chunk.files.forEach((f) => preload.add(f));
          }

          for (const mod of mods) {
            const chunksSet = new Set(mod.chunks);
            for (const subChunk of stats.chunks) {
              if (chunksSet.has(subChunk.id)) {
                if (subChunk.files) {
                  subChunk.files.forEach((f) => preload.add(f));
                }
              }
            }
          }
        }
      }

      return substring.replace(
        dynamicImport,
        `${dynamicImport}.then((m) => Object.assign((m && m.default) || m, { preload: ${JSON.stringify(
          [...preload]
        )} }))`
      );
    }
  );

  done(null, replaced, null);
}

module.exports = lazyLoader;
