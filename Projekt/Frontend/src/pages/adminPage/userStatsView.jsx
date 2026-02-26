import "./adminView.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { clientService } from "../../router/apiRouter";
import { showToast } from "../../components/Toast/showToast";
import Statistics from "../../classes/Views/statistics";
import {
    ArrowLeft,
    Loader2,
    User,
    Mail,
    Shield,
    Calendar,
    Target,
    CheckCircle2,
    BarChart3,
    TrendingUp,
    Zap,
    Award,
} from "lucide-react";

export function UserStatsView() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, [userId]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            // Get all users and find matching one
            const allUsers = await clientService.getAllUsers();
            const foundUser = allUsers.find((u) => String(u.user_id) === String(userId));
            setUser(foundUser || null);

            // Get stats for the target user via admin endpoint
            try {
                const statsData = await clientService.getUserStatistics(userId);
                const raw = Array.isArray(statsData) ? statsData[0] : statsData;
                setStats(new Statistics(raw));
            } catch {
                setStats(null);
            }
        } catch (err) {
            showToast("Hiba az adatok betöltésekor!", "error");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "–";
        const d = new Date(dateStr);
        return d.toLocaleDateString("hu-HU", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getRoleBadgeClass = (role) => {
        switch (role?.toLowerCase()) {
            case "admin":
                return "role-badge role-admin";
            case "moderator":
                return "role-badge role-moderator";
            default:
                return "role-badge role-user";
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <Loader2 size={48} className="animate-spin" />
                <p>Adatok betöltése...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="admin-view">
                <div className="user-stats-header">
                    <button className="back-btn" onClick={() => navigate("/admin")}>
                        <ArrowLeft size={20} />
                        Vissza
                    </button>
                </div>
                <div className="user-stats-empty">
                    <p>A felhasználó nem található.</p>
                </div>
            </div>
        );
    }

    const completionRate = stats?.getDailyCompletionRate() || 0;
    const weeklyRate = stats?.getWeeklyCompletionRate() || 0;
    const difficulty = stats?.getDifficultyDistribution() || { hard: 0, middle: 0, easy: 0 };

    return (
        <div className="admin-view">
            {/* Back button */}
            <div className="user-stats-header">
                <button className="back-btn" onClick={() => navigate("/admin")}>
                    <ArrowLeft size={20} />
                    Vissza a felhasználókhoz
                </button>
            </div>

            {/* User Profile Card */}
            <div className="user-profile-card">
                <div className="user-profile-avatar-large">
                    {user.username?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="user-profile-info">
                    <h1>{user.username}</h1>
                    <div className="user-profile-meta">
                        <span className="meta-item">
                            <Mail size={16} />
                            {user.email}
                        </span>
                        <span className="meta-item">
                            <Shield size={16} />
                            <span className={getRoleBadgeClass(user.role)}>{user.role}</span>
                        </span>
                        <span className="meta-item">
                            <Calendar size={16} />
                            Csatlakozott: {formatDate(user.register_date)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            {stats ? (
                <>
                    <div className="user-stats-grid">
                        <div className="user-stat-card card-total">
                            <div className="user-stat-icon">
                                <Target size={24} />
                            </div>
                            <div className="user-stat-content">
                                <span className="user-stat-number">{stats.totalActivities}</span>
                                <span className="user-stat-label">Összes tevékenység</span>
                            </div>
                        </div>
                        <div className="user-stat-card card-completed">
                            <div className="user-stat-icon">
                                <CheckCircle2 size={24} />
                            </div>
                            <div className="user-stat-content">
                                <span className="user-stat-number">{stats.completedActivities}</span>
                                <span className="user-stat-label">Teljesített</span>
                            </div>
                        </div>
                        <div className="user-stat-card card-daily">
                            <div className="user-stat-icon">
                                <Zap size={24} />
                            </div>
                            <div className="user-stat-content">
                                <span className="user-stat-number">{stats.dailyTasksCount}</span>
                                <span className="user-stat-label">Napi feladatok</span>
                            </div>
                        </div>
                        <div className="user-stat-card card-events">
                            <div className="user-stat-icon">
                                <Calendar size={24} />
                            </div>
                            <div className="user-stat-content">
                                <span className="user-stat-number">{stats.monthlyEventsCount}</span>
                                <span className="user-stat-label">Havi események</span>
                            </div>
                        </div>
                    </div>

                    {/* Completion Rates */}
                    <div className="user-stats-section">
                        <h2>
                            <TrendingUp size={20} />
                            Teljesítési arányok
                        </h2>
                        <div className="completion-rates">
                            <div className="completion-item">
                                <div className="completion-header">
                                    <span>Napi teljesítés</span>
                                    <span className="completion-percent">{completionRate}%</span>
                                </div>
                                <div className="progress-bar-track">
                                    <div
                                        className="progress-bar-fill daily-fill"
                                        style={{ width: `${completionRate}%` }}
                                    />
                                </div>
                            </div>
                            <div className="completion-item">
                                <div className="completion-header">
                                    <span>Heti teljesítés</span>
                                    <span className="completion-percent">{weeklyRate}%</span>
                                </div>
                                <div className="progress-bar-track">
                                    <div
                                        className="progress-bar-fill weekly-fill"
                                        style={{ width: `${weeklyRate}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Difficulty Distribution */}
                    <div className="user-stats-section">
                        <h2>
                            <BarChart3 size={20} />
                            Nehézségi eloszlás
                        </h2>
                        <div className="difficulty-grid">
                            <div className="difficulty-card diff-easy">
                                <span className="diff-label">Könnyű</span>
                                <span className="diff-count">{stats.easyTasks}</span>
                                <div className="diff-bar-track">
                                    <div
                                        className="diff-bar-fill easy-fill"
                                        style={{ width: `${difficulty.easy}%` }}
                                    />
                                </div>
                                <span className="diff-percent">{difficulty.easy}%</span>
                            </div>
                            <div className="difficulty-card diff-medium">
                                <span className="diff-label">Közepes</span>
                                <span className="diff-count">{stats.middleTasks}</span>
                                <div className="diff-bar-track">
                                    <div
                                        className="diff-bar-fill medium-fill"
                                        style={{ width: `${difficulty.middle}%` }}
                                    />
                                </div>
                                <span className="diff-percent">{difficulty.middle}%</span>
                            </div>
                            <div className="difficulty-card diff-hard">
                                <span className="diff-label">Nehéz</span>
                                <span className="diff-count">{stats.hardTasks}</span>
                                <div className="diff-bar-track">
                                    <div
                                        className="diff-bar-fill hard-fill"
                                        style={{ width: `${difficulty.hard}%` }}
                                    />
                                </div>
                                <span className="diff-percent">{difficulty.hard}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Summary */}
                    <div className="user-stats-section">
                        <h2>
                            <Award size={20} />
                            Heti összesítés
                        </h2>
                        <div className="weekly-summary">
                            <div className="weekly-item">
                                <span className="weekly-label">Heti feladatok</span>
                                <span className="weekly-value">{stats.weeklyTasks}</span>
                            </div>
                            <div className="weekly-item">
                                <span className="weekly-label">Heti teljesített</span>
                                <span className="weekly-value">{stats.weeklyCompleted}</span>
                            </div>
                            <div className="weekly-item">
                                <span className="weekly-label">Heti arány</span>
                                <span className="weekly-value">{weeklyRate}%</span>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="user-stats-empty">
                    <BarChart3 size={48} />
                    <p>Nincs elérhető statisztika ehhez a felhasználóhoz.</p>
                </div>
            )}
        </div>
    );
}
