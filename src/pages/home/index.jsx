import { h, Fragment } from "preact";
import { useState } from "preact/hooks";
import { useTitle } from "hoofd/preact";

import Button from "../../components/button";

export default function Home() {
  useTitle("Home");

  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Home Page :D</h1>

      <p>Count: {count}</p>
      <Button onClick={() => setCount(count - 1)}>{"-"}</Button>
      <Button onClick={() => setCount(count + 1)}>{"+"}</Button>
    </>
  );
}
