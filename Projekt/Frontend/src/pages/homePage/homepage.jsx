import "./homepage.css"
import { Calendar, SquareCheckBig, Target, TrendingUp, CircleCheck, ArrowRight, Sparkles, Loader2, Clock } from "lucide-react"
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { clientService, activityService, eventService } from "../../router/apiRouter";
import { EventMiniPopup } from "../../components/EventPopup/EventMiniPopup";
import { EventPopup } from "../../components/EventPopup/EventPopup";
import { showToast } from "../../components/Toast/showToast";
import Statistics from "../../classes/Views/statistics";

export function HomepageView(){
    const [currentQuote, setCurrentQuote] = useState(0);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statsObj, setStatsObj] = useState(null);
    const [futureEvents, setFutureEvents] = useState([]);
    const [todayEvents, setTodayEvents] = useState([]);
    const [miniPopup, setMiniPopup] = useState({ show: false, event: null, position: { x: 0, y: 0 } });
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

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
            const statsRaw = Array.isArray(statsData) ? statsData[0] : statsData;
            const statsInstance = new Statistics(statsRaw);
            const allHabits = await activityService.getAllHabits();
            const activeCount = Statistics.getActiveHabitsCount(allHabits);
            statsInstance.setExtra('activeHabitsCount', activeCount);
            setStatsObj(statsInstance);

            const eventsData = await eventService.getOverview();
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
            const upcoming = eventsData
                .filter(e => new Date(e.event_start_time) > now)
                .sort((a, b) => new Date(a.event_start_time) - new Date(b.event_start_time));
            setFutureEvents(upcoming);
            const todays = eventsData
                .filter(e => {
                    const d = new Date(e.event_start_time);
                    const dStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                    return dStr === todayStr;
                })
                .sort((a, b) => new Date(a.event_start_time) - new Date(b.event_start_time));
            setTodayEvents(todays);
        }
        catch(error){
            setError(error.message || "Hiba az adatok betöltése során.");
            console.log(error);
        }
        finally{
            setLoading(false);
        }
    }
    
    const getTodayDate = () => {
        return new Date().toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const completionRate = statsObj ? statsObj.getDailyCompletionRate() : 0;

    return(
        <section>
            <div className="info-text-div">
                <h3>Szia {profile.username}!</h3>
                <p className="stat-header-text">A mai dátum: {getTodayDate()}</p>
            </div>
            <div className="progress-view-div">
                <div className="progress-header">
                    <div className="progress-title-group">
                        <TrendingUp size={18} className="progress-icon"/>
                        <p>Mai haladás</p>
                    </div>
                    <span className="progress-badge">{completionRate}%</span>
                </div>
                <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${completionRate}%` }}></div>
                </div>
                <div className="progress-milestones">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                </div>
                <p className="progress-motivation">
                    {completionRate >= 100 ? "Kiváló! Minden feladatot teljesítettél!"
                    : completionRate >= 75 ? "Szinte kész vagy, hajrá!"
                    : completionRate >= 50 ? "Már félúton jársz, csak így tovább!"
                    : completionRate > 0 ? "Jó kezdés, ne add fel!"
                    : "Kezdd el a mai feladataidat!"}
                </p>
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
                            <Calendar size={50}/>
                            <p className="access-title">Naptár</p>
                            <p className="access-desc">Események és találkozók kezelése</p>
                        </div>
                        <div className="access-div tasks" onClick={() => navigate("/tasks")}>
                            <ArrowRight className="arrow-icon"/>
                            <SquareCheckBig size={50}/>
                            <p className="access-title">Feladatok</p>
                            <p className="access-desc">Mai teendők és feladatok</p>
                        </div>
                        <div className="access-div habits" onClick={() => navigate("/habits")}>
                            <ArrowRight className="arrow-icon"/>
                            <Target size={50}/>
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
                            <p className="stat-label purple">Összes</p>
                            <SquareCheckBig/>
                            <p className="stat-name">Feladatok</p>
                            <p className="stat-value purple">{statsObj?.totalActivities || 0} db</p>
                        </div>
                        <div className="stat-div finished">
                            <p className="stat-label green">Kész</p>
                            <CircleCheck/>
                            <p className="stat-name">Befejezett</p>
                            <p className="stat-value green">{statsObj?.completedActivities || 0} / {statsObj?.totalActivities || 0}</p>
                        </div>
                        <div className="stat-div events">
                            <p className="stat-label blue">Mostanában</p>
                            <Calendar/>
                            <p className="stat-name">Események</p>
                            <p className="stat-value blue">{statsObj?.monthlyEventsCount || 0} db</p>
                        </div>
                        <div className="stat-div habits">
                            <p className="stat-label pink">Aktív</p>
                            <Target/>
                            <p className="stat-name">Szokások</p>
                            <p className="stat-value pink">{statsObj?.getExtra('activeHabitsCount') || 0} db</p>
                        </div>
                    </div>
            </section>

            <div className="events-row">
                <section className="upcoming-events-section">
                    <div className="upcoming-events-header">
                        <div className="upcoming-events-title-group">
                            <Clock size={18} className="upcoming-events-icon today-icon" />
                            <h3>Mai események</h3>
                        </div>
                        <span className="upcoming-events-count">{todayEvents.length} esemény</span>
                    </div>
                    <div className="upcoming-events-list">
                        {todayEvents.length === 0 ? (
                            <p className="upcoming-events-empty">Nincsenek mai események.</p>
                        ) : (
                            todayEvents.map(ev => {
                                const start = new Date(ev.event_start_time);
                                const end = new Date(ev.event_end_time || ev.endTime || ev.end_time);
                                return (
                                    <div key={ev.event_id} className="upcoming-event-item" onClick={(e) => {
                                        e.stopPropagation();
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setMiniPopup({ show: true, event: ev, position: { x: rect.right - 160, y: rect.top + 8 } });
                                    }}>
                                        <div className="upcoming-event-dot" style={{ background: ev.event_color || '#3b82f6' }}></div>
                                        <div className="upcoming-event-info">
                                            <span className="upcoming-event-name">{ev.event_name}</span>
                                            <span className="upcoming-event-time">
                                                {start.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                                                {(!isNaN(end) ? (` — ${end.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}`) : '')}
                                            </span>
                                        </div>
                                        <ArrowRight size={14} className="upcoming-event-arrow" />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                <section className="upcoming-events-section">
                    <div className="upcoming-events-header">
                        <div className="upcoming-events-title-group">
                            <Clock size={18} className="upcoming-events-icon" />
                            <h3>Közelgő események</h3>
                        </div>
                        <span className="upcoming-events-count">{futureEvents.length} esemény</span>
                    </div>
                    <div className="upcoming-events-list">
                        {futureEvents.length === 0 ? (
                            <p className="upcoming-events-empty">Nincsenek közelgő események.</p>
                        ) : (
                            futureEvents.map(ev => {
                                const start = new Date(ev.event_start_time);
                                const end = new Date(ev.event_end_time || ev.endTime || ev.end_time);
                                return (
                                    <div key={ev.event_id} className="upcoming-event-item" onClick={(e) => {
                                        e.stopPropagation();
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setMiniPopup({ show: true, event: ev, position: { x: rect.right - 160, y: rect.top + 8 } });
                                    }}>
                                        <div className="upcoming-event-dot" style={{ background: ev.event_color || '#3b82f6' }}></div>
                                        <div className="upcoming-event-info">
                                            <span className="upcoming-event-name">{ev.event_name}</span>
                                            <span className="upcoming-event-time">
                                                {start.toLocaleDateString('hu-HU', { month: 'long', day: 'numeric' })}
                                                {' · '}
                                                {start.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                                                {(!isNaN(end) ? (` — ${end.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}`) : '')}
                                            </span>
                                        </div>
                                        <ArrowRight size={14} className="upcoming-event-arrow" />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>
            </div>
                    {miniPopup.show && (
                        <EventMiniPopup
                            event={miniPopup.event}
                            position={miniPopup.position}
                            onEdit={(ev) => {
                                setEditingEvent(ev);
                                setShowEventPopup(true);
                                setMiniPopup({ show: false, event: null, position: { x: 0, y: 0 } });
                            }}
                            onDelete={async (id) => {
                                try {
                                    const eventId = typeof id === 'object' ? (id.event_id || id.eventId) : id;
                                    await eventService.deleteEvent(Number(eventId));
                                    showToast('Esemény sikeresen törölve!', 'success');
                                    setMiniPopup({ show: false, event: null, position: { x: 0, y: 0 } });
                                    fetchData();
                                } catch (err) {
                                    console.error('Delete upcoming event error:', err);
                                    showToast('Hiba történt az esemény törlésekor!', 'error');
                                }
                            }}
                            onClose={() => setMiniPopup({ show: false, event: null, position: { x: 0, y: 0 } })}
                        />
                    )}

                    {showEventPopup && (
                        <EventPopup
                            isOpen={showEventPopup}
                            onClose={() => { setShowEventPopup(false); setEditingEvent(null); }}
                            onSave={async (eventData) => {
                                try {
                                    if (editingEvent) {
                                        const id = editingEvent.event_id || editingEvent.eventId;
                                        await eventService.updateEvent(Number(id), eventData);
                                        showToast('Esemény sikeresen módosítva!', 'success');
                                    } else {
                                        await eventService.createEvent(eventData);
                                        showToast('Esemény sikeresen létrehozva!', 'success');
                                    }
                                    fetchData();
                                } catch (err) {
                                    console.error('Save upcoming event error:', err);
                                    showToast('Hiba történt az esemény mentésekor!', 'error');
                                }
                            }}
                            selectedDate={editingEvent ? new Date(editingEvent.event_start_time) : null}
                            selectedHour={null}
                            existingEvent={editingEvent}
                            eventsForDay={editingEvent ? [editingEvent] : []}
                        />
                    )}
        </section>
    )
}