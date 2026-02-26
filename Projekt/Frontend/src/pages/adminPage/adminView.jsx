import "./adminView.css";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { clientService } from "../../router/apiRouter";
import { showToast } from "../../components/Toast/showToast";
import {
    Search,
    Pencil,
    Trash2,
    X,
    Save,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Users,
    UserCheck,
    Shield,
    UserX,
    ShieldAlert,
} from "lucide-react";

const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export function AdminView() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [authorized, setAuthorized] = useState(false);

    const [showEditPopup, setShowEditPopup] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editUsername, setEditUsername] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editRole, setEditRole] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [deletingUser, setDeletingUser] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("user");
            const currentUser = stored ? JSON.parse(stored) : null;
            const role = currentUser?.role?.toLowerCase();
            if (role === "admin" || role === "moderator") {
                setAuthorized(true);
                fetchUsers();
            } else {
                setAuthorized(false);
                setLoading(false);
            }
        } catch {
            setAuthorized(false);
            setLoading(false);
        }
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await clientService.getAllUsers();
            setUsers(data);
        } catch (err) {
            showToast("Hiba a felhasználók betöltésekor!", "error");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        let result = [...users];
        if (roleFilter !== "all") {
            result = result.filter(
                (u) => u.role?.toLowerCase() === roleFilter.toLowerCase()
            );
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (u) =>
                    u.username?.toLowerCase().includes(q) ||
                    u.email?.toLowerCase().includes(q)
            );
        }
        return result;
    }, [users, roleFilter, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, roleFilter, rowsPerPage]);

    const totalUsers = users.length;
    const adminCount = users.filter((u) => u.role?.toLowerCase() === "admin").length;
    const moderatorCount = users.filter((u) => u.role?.toLowerCase() === "moderator").length;
    const userCount = users.filter((u) => u.role?.toLowerCase() === "user").length;

    const openEditPopup = (user, e) => {
        e.stopPropagation();
        setEditingUser(user);
        setEditUsername(user.username || "");
        setEditEmail(user.email || "");
        setEditRole(user.role || "user");
        setShowEditPopup(true);
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        if (!editUsername.trim() || !editEmail.trim()) {
            showToast("A felhasználónév és az email kötelező!", "error");
            return;
        }
        setEditLoading(true);
        try {
            await clientService.editUser(editingUser.user_id, {
                username: editUsername.trim(),
                email: editEmail.trim(),
                role: editRole,
            });
            showToast("Felhasználó sikeresen frissítve!", "success");
            setShowEditPopup(false);
            fetchUsers();
        } catch (err) {
            showToast(err.message || "Hiba a mentés során!", "error");
        } finally {
            setEditLoading(false);
        }
    };

    const openDeletePopup = (user, e) => {
        e.stopPropagation();
        setDeletingUser(user);
        setShowDeletePopup(true);
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await clientService.deleteUser(deletingUser.user_id);
            showToast("Felhasználó sikeresen törölve!", "success");
            setShowDeletePopup(false);
            fetchUsers();
        } catch (err) {
            showToast(err.message || "Hiba a törlés során!", "error");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleRowClick = (user) => {
        navigate(`/admin/user/${user.user_id}`);
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

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <Loader2 size={48} className="animate-spin" />
                <p>Felhasználók betöltése...</p>
            </div>
        );
    }

    if (!authorized) {
        return (
            <div className="admin-view">
                <div className="admin-unauthorized">
                    <ShieldAlert size={56} />
                    <h2>Hozzáférés megtagadva</h2>
                    <p>Ez az oldal csak adminisztrátorok és moderátorok számára érhető el.</p>
                    <button className="back-btn" onClick={() => navigate("/")}>
                        Vissza a főoldalra
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-view">
            <div className="admin-header">
                <h1>Felhasználókezelés</h1>
                <p className="admin-subtitle">
                    Felhasználók kezelése, szerepkörök kiosztása és tevékenység figyelése.
                </p>
            </div>

            <div className="admin-stats-grid">
                <div className="admin-stat-card stat-total">
                    <div className="stat-icon-wrap">
                        <Users size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-number">{totalUsers}</span>
                        <span className="stat-label">Összes felhasználó</span>
                    </div>
                </div>
                <div className="admin-stat-card stat-admin">
                    <div className="stat-icon-wrap">
                        <Shield size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-number">{adminCount}</span>
                        <span className="stat-label">Admin</span>
                    </div>
                </div>
                <div className="admin-stat-card stat-moderator">
                    <div className="stat-icon-wrap">
                        <UserCheck size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-number">{moderatorCount}</span>
                        <span className="stat-label">Moderátor</span>
                    </div>
                </div>
                <div className="admin-stat-card stat-user">
                    <div className="stat-icon-wrap">
                        <UserX size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-number">{userCount}</span>
                        <span className="stat-label">Felhasználó</span>
                    </div>
                </div>
            </div>

            <div className="admin-toolbar">
                <div className="admin-search-wrap">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Keresés név vagy email alapján..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="admin-search-input"
                    />
                </div>
                <div className="admin-filters">
                    <select
                        className="admin-filter-select"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">Összes szerepkör</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderátor</option>
                        <option value="user">Felhasználó</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Felhasználónév</th>
                            <th>Email</th>
                            <th>Szerepkör</th>
                            <th>Regisztráció</th>
                            <th>Műveletek</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="empty-row">
                                    Nincs találat.
                                </td>
                            </tr>
                        ) : (
                            paginatedUsers.map((user) => (
                                <tr
                                    key={user.user_id || user.email}
                                    className="user-row"
                                    onClick={() => handleRowClick(user)}
                                    title="Kattints a statisztikák megtekintéséhez"
                                >
                                    <td className="cell-username">
                                        <div className="user-avatar">
                                            {user.username?.charAt(0)?.toUpperCase() || "?"}
                                        </div>
                                        <span>{user.username}</span>
                                    </td>
                                    <td className="cell-email">{user.email}</td>
                                    <td>
                                        <span className={getRoleBadgeClass(user.role)}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="cell-date">
                                        {formatDate(user.register_date)}
                                    </td>
                                    <td className="cell-actions">
                                        <button
                                            className="action-btn edit-btn"
                                            onClick={(e) => openEditPopup(user, e)}
                                            title="Szerkesztés"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={(e) => openDeletePopup(user, e)}
                                            title="Törlés"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="admin-pagination">
                <div className="pagination-info">
                    <span>Sorok oldalanként:</span>
                    <select
                        value={rowsPerPage}
                        onChange={(e) => setRowsPerPage(Number(e.target.value))}
                        className="rows-select"
                    >
                        {ROWS_PER_PAGE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                    <span className="pagination-count">
                        {filteredUsers.length} felhasználóból{" "}
                        {Math.min((currentPage - 1) * rowsPerPage + 1, filteredUsers.length)}–
                        {Math.min(currentPage * rowsPerPage, filteredUsers.length)}
                    </span>
                </div>
                <div className="pagination-controls">
                    <button
                        className="page-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(1)}
                    >
                        <ChevronsLeft size={16} />
                    </button>
                    <button
                        className="page-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    {getPageNumbers().map((num) => (
                        <button
                            key={num}
                            className={`page-btn page-num ${num === currentPage ? "active" : ""}`}
                            onClick={() => setCurrentPage(num)}
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        className="page-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                    >
                        <ChevronRight size={16} />
                    </button>
                    <button
                        className="page-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                    >
                        <ChevronsRight size={16} />
                    </button>
                </div>
            </div>

            {showEditPopup && (
                <div className="admin-popup-overlay" onClick={() => setShowEditPopup(false)}>
                    <div className="admin-popup" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <h2>Felhasználó szerkesztése</h2>
                            <button
                                className="popup-close-btn"
                                onClick={() => setShowEditPopup(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSave} className="popup-form">
                            <div className="popup-field">
                                <label>Felhasználónév</label>
                                <input
                                    type="text"
                                    value={editUsername}
                                    onChange={(e) => setEditUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="popup-field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="popup-field">
                                <label>Szerepkör</label>
                                <select
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value)}
                                >
                                    <option value="user">Felhasználó</option>
                                    <option value="moderator">Moderátor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="popup-actions">
                                <button
                                    type="button"
                                    className="popup-cancel-btn"
                                    onClick={() => setShowEditPopup(false)}
                                >
                                    Mégse
                                </button>
                                <button
                                    type="submit"
                                    className="popup-save-btn"
                                    disabled={editLoading}
                                >
                                    {editLoading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    Mentés
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeletePopup && (
                <div className="admin-popup-overlay" onClick={() => setShowDeletePopup(false)}>
                    <div
                        className="admin-popup delete-popup"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="popup-header delete-header">
                            <h2>Felhasználó törlése</h2>
                            <button
                                className="popup-close-btn"
                                onClick={() => setShowDeletePopup(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="delete-body">
                            <div className="delete-warning-icon">
                                <Trash2 size={40} />
                            </div>
                            <p>
                                Biztosan törölni szeretnéd{" "}
                                <strong>{deletingUser?.username}</strong> felhasználót?
                            </p>
                            <p className="delete-subtext">
                                Ez a művelet nem vonható vissza.
                            </p>
                        </div>
                        <div className="popup-actions">
                            <button
                                type="button"
                                className="popup-cancel-btn"
                                onClick={() => setShowDeletePopup(false)}
                            >
                                Mégse
                            </button>
                            <button
                                type="button"
                                className="popup-delete-confirm-btn"
                                onClick={handleDelete}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Trash2 size={16} />
                                )}
                                Törlés
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}