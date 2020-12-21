import { h } from "preact";
import { Router } from "preact-iso/router";
import lazy, { ErrorBoundary } from "preact-iso/lazy";
import { useLang, useTitleTemplate } from "hoofd/preact";

import Shell from "./components/shell";

const publicPath = PUBLIC_PATH;

const Home = lazy(() => import("./pages/home"));
const About = lazy(() => import("./pages/about"));
const NotFound = lazy(() => import("./pages/_404"));

function routePath(path) {
  if (typeof window === "undefined") {
    return path;
  }

  if (path === "/") {
    return publicPath;
  }

  return publicPath + path;
}

export default function App() {
  useLang("en-us");
  useTitleTemplate("%s | Example");

  return (
    <Shell>
      <ErrorBoundary>
        <Router>
          <Home path={routePath("/")} />
          <About path={routePath("/about")} />
          <NotFound default />
        </Router>
      </ErrorBoundary>
    </Shell>
  );
}
