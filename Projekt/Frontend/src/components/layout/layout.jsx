import { Sidebar } from "../Sidebar/sidebar";
import "./layout.css";

export function Layout({ children, className }) {
  return (
    <div className={`layout${className ? " " + className : ""}`}>
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
