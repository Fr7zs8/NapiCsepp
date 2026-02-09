import "./homepage.css"
import { Calendar, SquareCheckBig, Target, TrendingUp, CircleCheck, ArrowRight, Sparkles, Loader2 } from "lucide-react"
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { clientService } from "../../router/apiRouter";

export function HomepageView(){
    const [currentQuote, setCurrentQuote] = useState(0);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    const navigate = useNavigate();

    useEffect(()=>{
        fetchData();
    },[]);
    
    const fetchData = async () => {
        try{
            setLoading(true);
    
            const profileData = await clientService.getProfile();
            setProfile(Array.isArray(profileData) ? profileData[0] : profileData);
            
            const statsData = await clientService.getStatistics();
            setStats(Array.isArray(statsData) ? statsData[0] : statsData);
        }
        catch(error){
            setError(error.message || "Hiba az adatok betöltése során.");
            console.log(error);
        }
        finally{
            setLoading(false);
        }
    }        

    const quotes = [
        "A siker nem végleges, a kudarc nem végzetes: a folytatáshoz szükséges bátorság az, ami számít.",
        "Ne számold a napokat, tedd értékessé a napokat.",
        "A kezdés titka az, hogy felosztod a komplex, elsöprő feladatokat kis kezelhető feladatokra, majd elkezded az elsőt.",
        "Minden nap egy új lehetőség arra, hogy jobbá válj.",
        "A motiváció elindít, a szokás megtart téged az úton.",
        "Ne várj. Sosem lesz tökéletes az időzítés.",
        "A kis lépések is vezetnek nagy célokhoz.",
        "A változás fájdalmas, de semmi sem fájdalmasabb, mint ott ragadni, ahol nem tartozol."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % quotes.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="loading-state">
                <Loader2 size={48} className="animate-spin"/>
                <p>Adatok betöltése...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                <p>{error}</p>
                <button onClick={fetchData}>Újrapróbálkozás</button>
            </div>
        )
    };

    if (!profile) {
        return (
            <div className="error-state">
                <p>Profil adatok nem elérhetők.</p>
            </div>
        );
    }

    return(
        <section>
            <div className="info-text-div">
                <h3>Szia {profile.username}!</h3>
                <p>December van</p>
            </div>
            <div className="progress-view-div">
                <div>
                    <p>Mai haladás</p>
                    <span>0%</span>
                </div>
            </div>
            <div className="text-carousel-div">
                <Sparkles className="sparkles-icon"/>
                <p className="carousel-text">{quotes[currentQuote]}</p>
                <div className="carousel-dots">
                    {quotes.map((_, index) => (
                        <span key={index} className={`dot ${index === currentQuote ? 'active' : ''}`}></span>
                    ))}
                </div>
            </div>
            <div className="main-content-wrapper">
                <section className="quick-access-section">
                    <h3>Gyors hozzáférés</h3>
                    <div className="quick-access-list-div">
                        <div className="access-div calendar" onClick={() => navigate("/calendar/monthly")}>
                            <ArrowRight className="arrow-icon"/>
                            <Calendar/>
                            <p className="access-title">Naptár</p>
                            <p className="access-desc">Események és találkozók kezelése</p>
                        </div>
                        <div className="access-div tasks" onClick={() => navigate("/tasks")}>
                            <ArrowRight className="arrow-icon"/>
                            <SquareCheckBig/>
                            <p className="access-title">Feladatok</p>
                            <p className="access-desc">Mai teendők és feladatok</p>
                        </div>
                        <div className="access-div habits" onClick={() => navigate("/habits")}>
                            <ArrowRight className="arrow-icon"/>
                            <Target/>
                            <p className="access-title">Szokások</p>
                            <p className="access-desc">Adj hozzá szokást megadott időtartammal. A rendszer a megadott időszak minden napjára felveszi a to-do listába.</p>
                        </div>
                    </div>
                </section>
            </div>
            <section className="todays-statistics-section">
                <div className="statistics-header">
                    <TrendingUp/> 
                    <h3>Mai statisztikák</h3>
                </div>
                <p>Nézd meg a mai teljesítményedet egy pillantásra</p>
                <div className="statistics-list-div">
                        <div className="stat-div tasks">
                            <p className="stat-label">Összes</p>
                            <SquareCheckBig/>
                            <p className="stat-name">Feladatok</p>
                            <p className="stat-value">0 db</p>
                        </div>
                        <div className="stat-div finished">
                            <p className="stat-label">Kész</p>
                            <CircleCheck/>
                            <p className="stat-name">Befejezett</p>
                            <p className="stat-value">0 /0</p>
                        </div>
                        <div className="stat-div events">
                            <p className="stat-label">Ma</p>
                            <Calendar/>
                            <p className="stat-name">Események</p>
                            <p className="stat-value">0 db</p>
                        </div>
                        <div className="stat-div habits">
                            <p className="stat-label">Aktív</p>
                            <Target/>
                            <p className="stat-name">Szokások</p>
                            <p className="stat-value">0 db</p>
                        </div>
                    </div>
            </section>
        </section>
    )
}