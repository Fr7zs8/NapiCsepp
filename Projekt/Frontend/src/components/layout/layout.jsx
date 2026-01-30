import { Sidebar } from "./sidebar";
import "./layout.css";

export function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
