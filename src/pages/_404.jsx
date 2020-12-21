import { h } from "preact";
import { useTitle } from "hoofd/preact";

export default function NotFound() {
  useTitle("Not Found");

  return <h1>404: Not Found</h1>;
}
