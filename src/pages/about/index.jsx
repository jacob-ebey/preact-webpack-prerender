import { h } from "preact";
import { useTitle } from "hoofd/preact";

export default function About() {
  useTitle("About");

  return <h1>About Page :D</h1>;
}
