import { h } from "preact";
import cn from "classnames";

import styles from "./styles.module.css";

export default function Button({ as = "button", className, ...props }) {
  const Component = as;

  return <Component className={cn(styles.button, className)} {...props} />;
}
