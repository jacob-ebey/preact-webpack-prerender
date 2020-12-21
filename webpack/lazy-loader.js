/**
 * @param {string} source
 */
function lazyLoader(source) {
  const done = this.async();
  // TODO: Get chunks from stats and add to preload array

  const replaced = source.replace(
    /\)\s{0,}=>\s{0,}(import\s{0,}\([\'|\"](.*)[\'|\"]\s{0,}\))/g,
    (substring, ...args) => {
      const [dynamicImport, importPath] = args;
      changed = true;
      return substring.replace(
        dynamicImport,
        `${dynamicImport}.then((m) => Object.assign((m && m.default) || m, { preload: [] }))`
      );
    }
  );

  done(null, replaced, null);
}

module.exports = lazyLoader;
