import { h } from "preact";
import { useMeta } from "hoofd/preact";

import Link from "../link";

import styles from "./styles.module.css";

export default function Shell({ children }) {
  useMeta({
    name: "viewport",
    content: "width=device-width, initial-scale=1.0",
  });

  return (
    <div className={styles.wrapper}>
      <nav>
        <ul className={styles.list}>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
          </li>
        </ul>
      </nav>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
