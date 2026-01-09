import "./Sidebar.css";
import { Link, useLocation } from "react-router-dom";
import { Home, User, BarChart3, Calendar, CheckSquare, Target, LogOut } from "lucide-react";

export function Sidebar() {
    const location = useLocation();

    // Ha login vagy register oldalon vagyunk, ne jelenjen meg a sidebar
    if (location.pathname === "/login" || location.pathname === "/register") {
        return null;
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>NapiCsepp</h2>
            </div>

            <nav className="sidebar-nav">
                <Link 
                    to="/" 
                    className={`sidebar-link ${location.pathname === "/" ? "active" : ""}`}
                >
                    <Home size={20} />
                    <span>Főoldal</span>
                </Link>

                <Link 
                    to="/profile" 
                    className={`sidebar-link ${location.pathname === "/profile" ? "active" : ""}`}
                >
                    <User size={20} />
                    <span>Profil</span>
                </Link>

                <Link 
                    to="/statistics" 
                    className={`sidebar-link ${location.pathname === "/statistics" ? "active" : ""}`}
                >
                    <BarChart3 size={20} />
                    <span>Statisztika</span>
                </Link>

                <div className="sidebar-divider"></div>
                <p className="sidebar-category">Naptár</p>

                <Link 
                    to="/calendar/monthly" 
                    className={`sidebar-link ${(location.pathname === "/calendar/monthly" || location.pathname === "/calendar/weekly" || location.pathname === "/calendar/daily") ? "active" : ""}`}
                >
                    <Calendar size={20} />
                    <span>Naptár</span>
                </Link>


                <div className="sidebar-divider"></div>
                <p className="sidebar-category">Tevékenységek</p>

                <Link 
                    to="/tasks" 
                    className={`sidebar-link ${location.pathname === "/tasks" ? "active" : ""}`}
                >
                    <CheckSquare size={20} />
                    <span>Feladatok</span>
                </Link>

                <Link 
                    to="/habits" 
                    className={`sidebar-link ${location.pathname === "/habits" ? "active" : ""}`}
                >
                    <Target size={20} />
                    <span>Szokások</span>
                </Link>
            </nav>

            <div className="sidebar-footer">
                <Link to="/login" className="sidebar-link">
                    <LogOut size={20} />
                    <span>Kijelentkezés</span>
                </Link>
            </div>
        </aside>
    );
}