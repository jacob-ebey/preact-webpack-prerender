import { h } from "preact";

import Link from "../link";

export default function Shell({ children }) {
  return (
    <div className="shell">
      <nav>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
          </li>
        </ul>
      </nav>

      {children}
    </div>
  );
}
