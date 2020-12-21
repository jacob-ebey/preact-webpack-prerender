const fs = require("fs");
const path = require("path");

function holdBeforeFileExists(filePath, timeout) {
  timeout = timeout < 1000 ? 1000 : timeout;
  return new Promise((resolve) => {
    var timer = setTimeout(function () {
      resolve();
    }, timeout);

    var inter = setInterval(function () {
      if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
        clearInterval(inter);
        clearTimeout(timer);
        resolve();
      }
    }, 100);
  });
}

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
      mods.push(...findModulesForImportPath(mod.children, importPath));
    }
  }

  return mods;
}

function findModulesByIds(modules, ids) {
  const mods = [];
  for (const mod of modules || []) {
    if (mod && ids.has(mod.id)) {
      mods.push(mod);
    }

    if (mod && mod.children) {
      mods.push(...findModulesByIds(mod.children, ids));
    }
  }

  return mods;
}

/**
 * @param {string} source
 */
async function lazyLoader(source) {
  const done = this.async();
  // TODO: Get chunks from stats and add to preload array

  const statsPath = path.resolve(process.cwd(), "public/static/stats.json");
  await holdBeforeFileExists(statsPath, 10000);

  let stats;
  try {
    stats = JSON.parse(fs.readFileSync(statsPath, "utf-8").toString());
  } catch (e) {
    console.log(e);
  }

  if (!stats) {
    throw new Error("Stats not found");
  }

  const replaced = !stats
    ? source
    : source.replace(
        /\)\s{0,}=>\s{0,}(import\s{0,}\([\'|\"](.*)[\'|\"]\s{0,}\))/g,
        (substring, ...args) => {
          const [dynamicImport, importPath] = args;

          const preload = new Set();
          for (const chunk of stats.chunks) {
            if (chunk.modules && chunk.files) {
              const mods = findModulesForImportPath(chunk.modules, importPath);
              // TODO: Get deps of the mods.
              if (mods.length > 0) {
                chunk.files.forEach((f) => preload.add(f));

                const modIds = new Set(
                  mods.reduce(
                    (p, mod) => [
                      ...p,
                      ...(mod.modules ? mod.modules.map((m) => m.id) : []),
                    ],
                    []
                  )
                );
                const subMods = findModulesByIds(stats.modules, modIds);
                for (const subMod of subMods) {
                  if (subMod.chunks && subMod.chunks.length > 0) {
                    const chunkIds = new Set(subMod.chunks);
                    stats.chunks.forEach((c) => {
                      if (chunkIds.has(c.id)) {
                        c.files.forEach((f) => preload.add(f));
                      }
                    });
                  }
                }
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
