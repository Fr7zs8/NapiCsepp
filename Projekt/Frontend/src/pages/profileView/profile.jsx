import "./profile.css"
import { User, Mail, Database, Lock, Loader2, Award, Target, Calendar, X, Save } from "lucide-react";
import ProfileCard from "../../components/Profile/ProfileCard";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import DataItem from "../../components/Profile/DataItem";
import StatItem from "../../components/Profile/StatItem";
import { useState, useEffect } from "react";
import { clientService, activityService } from "../../router/apiRouter";
import Statistics from "../../classes/Views/statistics";
import { SquareCheckBig } from "lucide-react";

export function ProfileView(){

    const [profile, setProfile] = useState(null);
    const [statsObj, setStatsObj] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showEditPopup, setShowEditPopup] = useState(false);
    const [editUsername, setEditUsername] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [editError, setEditError] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editSuccess, setEditSuccess] = useState(false);

    useEffect(()=>{
        fetchData();
    },[])

    const fetchData = async () => {
        try{
            setLoading(true);

            const profileData = await clientService.getProfile();
            const p = Array.isArray(profileData) ? profileData[0] : profileData;
            setProfile(p);

            const statsData = await clientService.getStatistics();
            const statsRaw = Array.isArray(statsData) ? statsData[0] : statsData;
            const allHabits = await activityService.getAllHabits ? await activityService.getAllHabits() : [];
            const statsInstance = new Statistics(statsRaw);
            statsInstance.setExtra('activeHabitsCount', Statistics.getActiveHabitsCount(allHabits));
            setStatsObj(statsInstance);
        }
        catch(error){
            setError(error.message || "Hiba az adatok betöltése során.");
            console.log(error);
        }
        finally{
            setLoading(false);
        }
    }

    function openEditPopup() {
        setEditUsername(profile?.username || "");
        setEditEmail(profile?.email || "");
        setEditPassword("");
        setEditError("");
        setEditSuccess(false);
        setShowEditPopup(true);
    }

    async function handleEditSave(e) {
        e.preventDefault();
        setEditError("");
        if (!editUsername.trim() || !editEmail.trim()) {
            setEditError("A felhasználónév és az email cím kötelező!");
            return;
        }
        setEditLoading(true);
        try {
            const payload = { username: editUsername.trim(), email: editEmail.trim() };
            if (editPassword) payload.password = editPassword;
            await clientService.updateProfile(payload);
            setEditSuccess(true);
            setTimeout(() => {
                setShowEditPopup(false);
                fetchData();
            }, 1000);
        } catch (err) {
            setEditError(err.message || "Hiba az adatok mentésekor!");
        } finally {
            setEditLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="loading-state">
                <Loader2 size={48} className="animate-spin"/>
                <p>Profil betöltése...</p>
            </div>
        )
    }

    if (error) {
            return (
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={fetchData}>Újrapróbálkozás</button>
                </div>
            )
        }

    const roleMap = { admin: "Adminisztrátor", moderator: "Moderátor", user: "Felhasználó" };
    const roleHu = roleMap[profile.role?.toLowerCase()] || profile.role || "Felhasználó";

    return (
        <section className="profile-section">
            <div className="info-text-div">
                <h2>Profil</h2>
                <p>Tekintsd meg és kezeld a profil adataidat</p>
            </div>

                    <ProfileCard username={profile.username} email={profile.email} AvatarIcon={User} />

            <div className="data-list-div">
                <DataItem icon={Lock} label="Jelszó" value={'••••••••'} />
                <DataItem icon={Mail} label="Email cím" value={profile?.email} />
                <DataItem icon={User} label="Fiók típus" value={roleHu} />
                <DataItem icon={Calendar} label="Regisztráció dátuma" value={profile.register_date} />
            </div>

            <div className="edit-profile-div">
                <button className="edit-profile-btn" onClick={openEditPopup}>
                    Adatok szerkesztése
                </button>
            </div>

            {statsObj && (
                <div className="profile-stats-div">
                    <div className="stats-header">
                        <p className="stats-title">Profil statisztikák</p>
                        <p className="stats-subtitle">Az általános használati statisztikáid</p>
                    </div>
                    <div className="stats-grid">
                        <StatItem className="stat-tasks" label="Összes feladat" value={statsObj.totalActivities || 0}>
                            <><p className="data-label">Összes feladat</p><SquareCheckBig size={24} /></>
                        </StatItem>
                        <StatItem className="stat-completed" label="Befejezett aktivitások" value={statsObj.completedActivities || 0}>
                            <><p className="data-label">Befejezett aktivitások</p><Award size={24} /></>
                        </StatItem>
                        <StatItem className="stat-habits" label="Aktív szokások" value={statsObj.getExtra('activeHabitsCount') || 0}>
                            <><p className="data-label">Aktív szokások</p><Target size={24} /></>
                        </StatItem>
                        <StatItem className="stat-events" label="Hónapi események" value={statsObj.monthlyEventsCount || 0}>
                            <><p className="data-label">Hónapi események</p><Calendar size={24} /></>
                        </StatItem>
                    </div>
                </div>
            )}

            {showEditPopup && (
                <div className="edit-popup-overlay" onClick={() => setShowEditPopup(false)}>
                    <div className="edit-popup-card" onClick={e => e.stopPropagation()}>
                        <div className="edit-popup-header">
                            <h3>Adatok szerkesztése</h3>
                            <button className="edit-popup-close" onClick={() => setShowEditPopup(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleEditSave} className="edit-popup-form">
                            <div className="edit-field">
                                <label>Felhasználónév</label>
                                <div className="edit-input-row">
                                    <User size={16} />
                                    <input
                                        type="text"
                                        value={editUsername}
                                        onChange={e => setEditUsername(e.target.value)}
                                        placeholder="Felhasználónév"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="edit-field">
                                <label>Email cím</label>
                                <div className="edit-input-row">
                                    <Mail size={16} />
                                    <input
                                        type="email"
                                        value={editEmail}
                                        onChange={e => setEditEmail(e.target.value)}
                                        placeholder="pelda@email.hu"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="edit-field">
                                <label>Új jelszó <span className="optional-label">(hagyja üresen, ha nem változtatja)</span></label>
                                <div className="edit-input-row">
                                    <Lock size={16} />
                                    <PasswordInput
                                        className="profile-pw"
                                        value={editPassword}
                                        onChange={e => setEditPassword(e.target.value)}
                                        placeholder="Új jelszó"
                                    />
                                </div>
                            </div>

                            {editError && <p className="edit-error">{editError}</p>}
                            {editSuccess && <p className="edit-success">Sikeresen mentve!</p>}

                            <div className="edit-popup-actions">
                                <button type="button" className="edit-cancel-btn" onClick={() => setShowEditPopup(false)}>
                                    Mégse
                                </button>
                                <button type="submit" className="edit-save-btn" disabled={editLoading}>
                                    <Save size={16} />
                                    {editLoading ? "Mentés..." : "Mentés"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )} 
        </section>
    )
}
