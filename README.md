# Preact Webpack Prerender

POC of pre-rendering Preact applications via a webpack plugin using preact-iso.

[Example](https://jacob-ebey.js.org/preact-webpack-prerender/)

## How it works

Within `webpack.config.js` there is a list of paths defined at the top that is passed onto the `webpack/prerender-plugin.js` that looks like:

```js
const paths = ["/", "/about"];
//..........
new PreactPrerenderPlugin({
  paths,
});
```

The prerender plugin taps the `afterEmit` hook and uses the CJS assets, along with a cjs build of preact-iso to write html files out to the public directory. The node require cache is cleared of any non `node_module` requires between builds when in watch mode keeping your pre-rendered HTML in sync for local dev.
