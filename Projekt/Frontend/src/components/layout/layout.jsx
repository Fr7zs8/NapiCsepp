import { Sidebar } from "./Sidebar";
import "./Layout.css";

export function Layout({ children }) {
    return (
        <div className="layout">
            <Sidebar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}