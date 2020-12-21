import { h } from "preact";
import { useTitle } from "hoofd/preact";

export default function Home() {
  useTitle("Home");

  return <h1>Home Page :D</h1>;
}
