import { h, Fragment } from "preact";
import { useState } from "preact/hooks";
import { useTitle } from "hoofd/preact";

import useStaticResult from "preact-webpack-prerender/useStaticResult";
import Button from "../../components/button";

export default function Home() {
  useTitle("Home");

  const [count, setCount] = useState(0);

  const { hello } = useStaticResult("home-page-test", () => {
    return {
      hello: "World",
    };
  });

  return (
    <>
      <h1>Home Page :D</h1>

      <p>Hello static, {hello}</p>

      <p>Count: {count}</p>
      <Button onClick={() => setCount(count - 1)}>{"-"}</Button>
      <Button onClick={() => setCount(count + 1)}>{"+"}</Button>
    </>
  );
}
