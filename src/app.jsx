import { h } from "preact";
import { Router } from "preact-iso/router";
import lazy, { ErrorBoundary } from "preact-iso/lazy";
import { useLang, useTitleTemplate } from "hoofd/preact";

import Shell from "./components/shell";

const Home = lazy(() => import("./pages/home"));
const About = lazy(() => import("./pages/about"));
const NotFound = lazy(() => import("./pages/_404"));

export default function App() {
  useLang("en-us");
  useTitleTemplate("%s | Example");

  return (
    <Shell>
      <ErrorBoundary>
        <Router>
          <Home path="/" />
          <About path="/about" />
          <NotFound default />
        </Router>
      </ErrorBoundary>
    </Shell>
  );
}
