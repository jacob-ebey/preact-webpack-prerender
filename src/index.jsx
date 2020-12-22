import "preact/devtools";
import { h } from "preact";
import hydrate from "preact-iso/hydrate";
import { LocationProvider } from "preact-iso/router";

import App from "./app";

export default function Client() {
  return (
    <LocationProvider>
      <App />
    </LocationProvider>
  );
}

hydrate(<Client />, document.body);
