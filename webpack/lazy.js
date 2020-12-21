var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) =>
  __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __exportStar = (target, module2, desc) => {
  __markAsModule(target);
  if (
    (module2 && typeof module2 === "object") ||
    typeof module2 === "function"
  ) {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {
          get: () => module2[key],
          enumerable:
            !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable,
        });
  }
  return target;
};
var __toModule = (module2) => {
  if (module2 && module2.__esModule) return module2;
  return __exportStar(
    __defProp(
      module2 != null ? __create(__getProtoOf(module2)) : {},
      "default",
      { value: module2, enumerable: true }
    ),
    module2
  );
};
__export(exports, {
  ErrorBoundary: () => ErrorBoundary,
  default: () => lazy,
});
var preact = __toModule(require("preact"));
var hooks = __toModule(require("preact/hooks"));
function lazy(load) {
  let p, c;
  return (props) => {
    if (!p) p = load().then((m) => (c = (m && m.default) || m));
    const [, update] = hooks.useState(0);
    const r = hooks.useRef(c);
    if (!r.current) r.current = p.then(update);
    if (c === void 0) throw p;
    return preact.h(c, props);
  };
}
function ErrorBoundary(props) {
  this.componentDidCatch = absorb;
  return props.children;
}
function absorb(err) {
  if (err && err.then) this.__d = true;
  else if (this.props.onError) this.props.onError(err);
}
