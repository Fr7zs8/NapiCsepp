import "./sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { clientService, activityService } from "../../router/apiRouter";
import {
  Home,
  User,
  BarChart3,
  Calendar,
  CheckSquare,
  Target,
  LogOut,
  Menu,
  Droplet,
  X,
  Shield,
} from "lucide-react";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(null);

  const currentUser = (() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  })();
  const isAdmin = currentUser?.role?.toLowerCase() === "admin" || currentUser?.role?.toLowerCase() === "moderator";

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const [allActivities, habitsData] = await Promise.all([
          activityService.getAllActivities(),
          activityService.getAllHabits(),
        ]);

        // Build habit map with checked counts (same logic as task page)
        const habitMap = {};
        habitsData.forEach((h) => {
          const checkedCount = allActivities.filter(
            (a) =>
              a.type_name === "Szokás" &&
              a.activity_name === h.activity_name &&
              (a.activity_achive === 1 || a.activity_achive === true || a.activity_achive === "1"),
          ).length;
          let targetDaysVal = null;
          if (h.target_days || h.target_days === 0) {
            targetDaysVal = Number(h.target_days);
          } else if (h.activity_start_date && h.activity_end_date) {
            try {
              const sd = new Date(h.activity_start_date);
              const ed = new Date(h.activity_end_date);
              sd.setHours(0, 0, 0, 0);
              ed.setHours(0, 0, 0, 0);
              const diff = Math.floor((ed - sd) / (1000 * 60 * 60 * 24));
              targetDaysVal = Math.max(0, diff + 1);
            } catch { targetDaysVal = 0; }
          } else {
            targetDaysVal = 0;
          }
          const progressCounter = h.progress_counter;
          const daysElapsed = (progressCounter !== null && progressCounter !== undefined)
            ? Math.max(0, Number(progressCounter))
            : checkedCount;
          habitMap[h.activity_name] = { targetDays: targetDaysVal, daysElapsed };
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const visibleTasks = allActivities.filter((item) => {
          if (item.activity_start_date) {
            const startDate = new Date(item.activity_start_date + "T00:00:00");
            const endDate = item.activity_end_date
              ? new Date(item.activity_end_date + "T23:59:59")
              : startDate;
            if (startDate > today || endDate < today) return false;
          }
          if (item.type_name === "Szokás") {
            const hm = habitMap[item.activity_name];
            if (hm && hm.targetDays > 0 && hm.daysElapsed >= hm.targetDays) return false;
          }
          return true;
        });

        const pending = visibleTasks.filter(
          (a) => !(a.activity_achive === 1 || a.activity_achive === true || a.activity_achive === "1")
        ).length;

        setPendingCount(pending);
      } catch {
        setPendingCount(null);
      }
    };
    fetchPending();
  }, [location.pathname]);

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
          <div className="brand">
            <Droplet size={28} className="brand-drop" />
            <h2 className="brand-text">NapiCsepp</h2>
          </div>
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

          {isAdmin && (
            <>
              <div className="sidebar-divider"></div>
              <p className="sidebar-category">Adminisztráció</p>
              <Link
                to="/admin"
                className={`sidebar-link ${location.pathname.startsWith("/admin") ? "active" : ""}`}
                onClick={() => setIsOpen(false)}
              >
                <Shield size={20} />
                <span>Admin</span>
              </Link>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div
            className="sidebar-mini-profile"
            onClick={() => { navigate("/tasks"); setIsOpen(false); }}
            title="Nyitott feladatok – kattints a feladatokhoz"
          >
            <div className="mini-profile-counter">
              <span className="counter-num">{pendingCount ?? "–"}</span>
            </div>
            <div className="mini-profile-info">
              <span className="mini-profile-username">@{(currentUser?.username || "").toLowerCase()}</span>
              <span className="mini-profile-email">{currentUser?.email}</span>
            </div>
          </div>

          <button className="sidebar-link" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Kijelentkezés</span>
          </button>
        </div>
      </aside>
    </>
  );
}
