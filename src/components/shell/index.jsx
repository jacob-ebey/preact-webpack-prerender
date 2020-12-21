import { h } from "preact";

export default function Shell({ children }) {
  return (
    <div className="shell">
      <nav>
        <ul>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/about">About</a>
          </li>
        </ul>
      </nav>

      {children}
    </div>
  );
}
