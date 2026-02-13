import "./profile.css"
import { User, Mail, Database, Lock, Loader2, Award, Target, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { clientService, activityService } from "../../router/apiRouter";
import Statistics from "../../classes/Views/statistics";
import { SquareCheckBig } from "lucide-react";

export function ProfileView(){

    const [profile, setProfile] = useState(null);
    // nem kell külön stats változó
    const [statsObj, setStatsObj] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(()=>{
        fetchData();
    },[])

    const fetchData = async () => {
        try{
            setLoading(true);

            const profileData = await clientService.getProfile();
            setProfile(Array.isArray(profileData) ? profileData[0] : profileData);
            
            const statsData = await clientService.getStatistics();
            const statsRaw = Array.isArray(statsData) ? statsData[0] : statsData;
            // setStats(statsRaw); // nem kell, csak statsObj kell
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

    const roleHu = profile.role === "admin" ? "Adminisztrátor" : "Normál felhasználó";

    return (
        <section className="profile-section">
            <div className="info-text-div">
                <h2>Profil</h2>
                <p>Tekintsd meg és kezeld a profil adataidat</p>
            </div>

            <div className="profile-card-div">
                <div className="profile-avatar">
                    <User size={48} />
                </div>
                <div className="profile-info">
                    <h2 className="username">@{profile.username.toLowerCase()}</h2>
                    <p className="email">{profile.email}</p>
                </div>
            </div>

            <div className="data-list-div">
                <div className="data-item">
                    <div className="data-icon-label">
                        <Lock size={20} />
                        <p className="data-label">Jelszó</p>
                    </div>
                    <p className="data-value">••••••••</p>
                </div>
                
                <div className="data-item">
                    <div className="data-icon-label">
                        <Mail size={20} />
                        <p className="data-label">Email cím</p>
                    </div>
                    <p className="data-value">{profile?.email }</p>
                </div>
                
                <div className="data-item">
                    <div className="data-icon-label">
                        <User size={20} />
                        <p className="data-label">Fiók típus</p>
                    </div>
                    <p className="data-value">{roleHu}</p>
                </div>
                
                <div className="data-item">
                    <div className="data-icon-label">
                        <Calendar size={20} />
                        <p className="data-label">Regisztráció dátuma</p>
                    </div>
                    <p className="data-value">{profile.register_date}</p>
                </div>

                <div className="data-item">
                    <div className="data-icon-label">
                        <Database size={20} />
                        <p className="data-label">Adatok tárolása</p>
                    </div>
                    <p className="data-value">MySQL Adatbázis</p>
                </div>
            </div>
            
            {statsObj && (
                <div className="profile-stats-div">
                    <div className="stats-header">
                        <p className="stats-title">Profil statisztikák</p>
                        <p className="stats-subtitle">Az általános használati statisztikáid</p>
                    </div>
                    <div className="stats-grid">
                        <div className="data-item">
                            <div className="data-icon-label">
                                <p className="data-label">Összes feladat</p>
                                <SquareCheckBig size={24} />
                                
                            </div>
                            <div>
                                <p className="data-value">{statsObj.totalActivities || 0}</p>
                                
                            </div>
                        </div>
                        <div className="data-item">
                            <div className="data-icon-label">
                                <p className="data-label">Befejezett aktivitások</p>
                                <Award size={24} />
                            </div>
                            <div>
                                <p className="data-value">{statsObj.completedActivities || 0}</p>
                                
                            </div>
                        </div>
                        <div className="data-item">
                            <div className="data-icon-label">
                                <p className="data-label">Aktív szokások</p>
                                <Target size={24} />
                            </div>
                            <div>
                                <p className="data-value">{statsObj.getExtra('activeHabitsCount') || 0}</p>
                            </div>
                        </div>
                        <div className="data-item">
                            <div className="data-icon-label">
                            <p className="data-label">Hónapi események</p>
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p className="data-value">{statsObj.monthlyEventsCount || 0}</p>
                                
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
        )
    }