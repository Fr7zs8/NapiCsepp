import "./profile.css"
import { User, Mail, Calendar, Database, UserCircle, Lock } from "lucide-react";

export function ProfileView(){
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
                    <h3>Vendég felhasználó</h3>
                    <p className="username">@vendeg</p>
                    <p className="email">vendeg@vendeg.com</p>
                </div>
            </div>

            <div className="data-list-div">
                <div className="data-item">
                    <div className="data-icon-label">
                        <UserCircle size={20} />
                        <p className="data-label">Teljes név</p>
                    </div>
                    <p className="data-value">Vendég Felhasználó</p>
                </div>
                
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
                    <p className="data-value">vendeg@vendeg.com</p>
                </div>
                
                <div className="data-item">
                    <div className="data-icon-label">
                        <User size={20} />
                        <p className="data-label">Fiók típus</p>
                    </div>
                    <p className="data-value">Normál felhasználó</p>
                </div>
                
                <div className="data-item">
                    <div className="data-icon-label">
                        <Calendar size={20} />
                        <p className="data-label">Regisztráció dátuma</p>
                    </div>
                    <p className="data-value">2025. november 2.</p>
                </div>
                
                <div className="data-item">
                    <div className="data-icon-label">
                        <Database size={20} />
                        <p className="data-label">Adatok tárolása</p>
                    </div>
                    <p className="data-value">Helyi tárolás (LocalStorage)</p>
                </div>
            </div>
            <div className="profile-stats-div">
                <p className="stats-title">Profil statisztikák</p>
                <p className="stats-subtitle">Az általános használati statisztikáid</p>
                <div className="stats-grid">
                    <div className="stat-item">
                        <p className="stat-label">Befejezett</p>
                        <p className="stat-value">0</p>
                    </div>
                    <div className="stat-item">
                        <p className="stat-label">Szokások</p>
                        <p className="stat-value">0</p>
                    </div>
                    <div className="stat-item">
                        <p className="stat-label">Befejezett</p>
                        <p className="stat-value">0</p>
                    </div>
                </div>
            </div>
        </section>
    )
}