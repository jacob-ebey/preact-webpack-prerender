import { h } from "preact";
import { useMemo } from "preact/hooks";

const publicPath = typeof PUBLIC_PATH !== "undefined" ? PUBLIC_PATH : "";

export default function Link({ as = "a", href, ...rest }) {
  const url = useMemo(() => {
    if (publicPath) {
      return publicPath + href;
    }

    return href;
  }, [href]);

  const Component = as;

  return <Component href={url} {...rest} />;
}
