const { useMemo, useState } = require("preact/hooks");

/**
 * @typedef {() => void} UseStaticReloadFunc
 * @typedef {[any, UseStaticReloadFunc]} UseStaticResult
 */

let staticResults = {};

/**
 * TODO: Document and move to package
 * @param {string} key
 * @param {(path: string) => any} loader
 * @returns {any}
 */
function useStaticResult(key, loader) {
  const [, update] = useState();
  const resultRef =
    staticResults[key] ||
    (() => {
      let resolved = false;
      let value = undefined;

      if (typeof window !== "undefined") {
        if (
          typeof USE_STATIC_RESULTS !== "undefined" &&
          USE_STATIC_RESULTS[key]
        ) {
          resolved = true;
          value = USE_STATIC_RESULTS[key];
        }
      }

      return {
        promise: undefined,
        resolved,
        value,
      };
    })();
  staticResults[key] = resultRef;

  if (resultRef.resolved) {
    return resultRef.value;
  }

  if (!resultRef.promise) {
    resultRef.promise = Promise.resolve(loader()).then((value) => {
      resultRef.promise = undefined;
      resultRef.value = value;
      resultRef.resolved = true;
      update({});

      return value;
    });
    resultRef.promise.useStaticPromiseKey = key;
    resultRef.promise.useStaticPromise = true;
  }

  throw resultRef.promise;
}

useStaticResult.rewind = () => {
  staticResults = {};
};

module.exports = useStaticResult;
