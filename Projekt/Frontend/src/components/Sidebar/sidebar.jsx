import "./sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { clientService } from "../../router/apiRouter";
import {
  Home,
  User,
  BarChart3,
  Calendar,
  CheckSquare,
  Target,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  function handleLogout() {
    clientService.logout();
    setIsOpen(false);
    navigate("/login");
  }

  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <>
      <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && <div className="sidebar-backdrop" onClick={() => setIsOpen(false)}></div>}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>NapiCsepp</h2>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/"
            className={`sidebar-link ${location.pathname === "/" ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <Home size={20} />
            <span>Főoldal</span>
          </Link>

          <Link
            to="/profile"
            className={`sidebar-link ${location.pathname === "/profile" ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <User size={20} />
            <span>Profil</span>
          </Link>

          <Link
            to="/statistics"
            className={`sidebar-link ${location.pathname === "/statistics" ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <BarChart3 size={20} />
            <span>Statisztika</span>
          </Link>

          <div className="sidebar-divider"></div>
          <p className="sidebar-category">Naptár</p>

          <Link
            to="/calendar/monthly"
            className={`sidebar-link ${location.pathname.includes("/calendar") ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <Calendar size={20} />
            <span>Naptár</span>
          </Link>

          <div className="sidebar-divider"></div>
          <p className="sidebar-category">Tevékenységek</p>

          <Link
            to="/tasks"
            className={`sidebar-link ${location.pathname === "/tasks" ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <CheckSquare size={20} />
            <span>Feladatok</span>
          </Link>

          <Link
            to="/habits"
            className={`sidebar-link ${location.pathname === "/habits" ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <Target size={20} />
            <span>Szokások</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Kijelentkezés</span>
          </button>
        </div>
      </aside>
    </>
  );
}
