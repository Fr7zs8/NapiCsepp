import { useEffect, useState } from "react";
import "./statisticsView.css"
import { Calendar, SquareCheckBigIcon, Target, Award, TrendingUp, Activity, Loader2 } from "lucide-react"
import { clientService, activityService } from "../../router/apiRouter";
import Statistics from "../../classes/Views/statistics";

export function StatisticsView(){

    const [stats, setStats] = useState(null);
    const [statsObj, setStatsObj] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [weeklyPerDay, setWeeklyPerDay] = useState([]);
    const [savedFlash, setSavedFlash] = useState(false);

    useEffect(()=>{
        fetchStatistics();
    },[])

    useEffect(() => {
        const handler = () => {
            setSavedFlash(true);
            setTimeout(() => setSavedFlash(false), 2000);
            fetchStatistics();
        };
        window.addEventListener('itemSaved', handler);
        return () => window.removeEventListener('itemSaved', handler);
    }, []);

    const getWeekRange = (ref = new Date()) => {
        const d = new Date(ref);
        const dayIndex = (d.getDay() + 6) % 7;
        const monday = new Date(d);
        monday.setDate(d.getDate() - dayIndex);
        monday.setHours(0,0,0,0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23,59,59,999);
        return { monday, sunday };
    }

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const [statsRes, allActivities, allHabits] = await Promise.all([
                clientService.getStatistics(),
                activityService.getAllActivities(),
                activityService.getAllHabits()
            ]);

            const statsRaw = Array.isArray(statsRes) ? statsRes[0] : statsRes;
            setStats(statsRaw);
            const statsInstance = new Statistics(statsRaw);

            const { monday, sunday } = getWeekRange(new Date());
            const perDay = Array.from({length:7}, (_,i)=>({ completed:0, pending:0 }));

            (allActivities || []).forEach(a => {
                const startStr = a.activity_start_date || a.activity_date || a.date;
                const endStr = a.activity_end_date || startStr;
                if (!startStr) return;
                try {
                    const sd = new Date(startStr + 'T00:00:00');
                    const ed = new Date((endStr || startStr) + 'T00:00:00');
                    for (let d = new Date(sd); d <= ed; d.setDate(d.getDate() + 1)) {
                        if (d >= monday && d <= sunday) {
                            const idx = (d.getDay() + 6) % 7;
                            const done = a.activity_achive === 1 || a.activity_achive === true || a.activity_achive === "1";
                            if (done) perDay[idx].completed++;
                            else perDay[idx].pending++;
                        }
                    }
                } catch(e) {
                    //error ignorálása
                }
            });

            setWeeklyPerDay(perDay.map((d, i) => ({ day: ['H','K','Sze','Cs','P','Szo','V'][i], ...d })));

            const today = new Date();
            today.setHours(0,0,0,0);
            const activeCount = (allHabits || []).filter(h => {
                try {
                    const sd = h.activity_start_date ? new Date(h.activity_start_date + 'T00:00:00') : null;
                    const ed = h.activity_end_date ? new Date(h.activity_end_date + 'T23:59:59') : sd;
                    if (!sd || !ed) return false;
                    return sd <= today && ed >= today;
                } catch(e) { return false }
            }).length;
            const activeHabits = Statistics.getActiveHabitsCount(allHabits);
            statsInstance.setExtra('activeHabitsCount', activeHabits);
            statsInstance.setExtra('weeklyPerDay', perDay);
            setStatsObj(statsInstance);

        } catch (err) {
            setError(err.message || "Hiba az adatok betöltése során!");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

     if (loading) {
        return (
            <div className="loading-state">
                <Loader2 size={48} className="animate-spin"/>
                <p>Statisztikák betöltése...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                <p>{error}</p>
                <button onClick={fetchStatistics}>Újrapróbálkozás</button>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="error-state">
                <p>Nincs betöltött statisztika</p>
                <button onClick={fetchStatistics}>Újrapróbálkozás</button>
            </div>
        );
    }

    const totalTasks = statsObj?.totalActivities || 0;
    const completed = statsObj?.completedActivities || 0;
    const pending = totalTasks - completed;
    const completionRate = statsObj ? statsObj.getDailyCompletionRate() : 0;

    const activeHabitsCount = statsObj?.getExtra('activeHabitsCount') || 0;

    const weekData = statsObj?.getExtra('weeklyPerDay')?.map((d,i) => ({...d, day: ['H','K','Sze','Cs','P','Szo','V'][i]})) || [
        { day: 'H', completed:0, pending:0 },{ day: 'K', completed:0, pending:0 },{ day: 'Sze', completed:0, pending:0 },{ day: 'Cs', completed:0, pending:0 },{ day: 'P', completed:0, pending:0 },{ day: 'Szo', completed:0, pending:0 },{ day: 'V', completed:0, pending:0 }
    ];
    const weeklyTotal = weekData.reduce((s,d)=>s + d.completed + d.pending, 0);
    const weeklyCompleted = weekData.reduce((s,d)=>s + d.completed, 0);
    const weeklyAverage = weeklyTotal > 0 ? Math.round(weeklyTotal / 7) : 0;
    const maxValue = Math.max(...weekData.map(d => d.completed + d.pending), 1);

    return (
        <section className="statistics-section">
            <div className="info-text-div">
                <p>Statisztikák</p>
                <p>Részletes betekintés a teljesítményedbe</p>
            </div>

            <div className="counters-div">
                <div className="counter-div allTasks">
                    <p className="counter-label">Összes feladat</p>
                    <SquareCheckBigIcon size={32}/>
                    <p className="counter-value">{statsObj?.totalActivities || 0}</p>
                    <p className="counter-desc">Teendők + Szokások</p>
                </div>
                <div className="counter-div completed">
                    <p className="counter-label">Befejezett feladatok</p>
                    <Award size={32}/>
                    <p className="counter-value">{statsObj?.completedActivities || 0}</p>
                    <p className="counter-desc">Elvégzett feladatok</p>
                </div>
                <div className="counter-div events">
                    <p className="counter-label">Összes események</p>
                    <Calendar size={32}/>
                    <p className="counter-value">{statsObj?.monthlyEventsCount || 0}</p>
                    <p className="counter-desc">Naptári események</p>
                </div>
                <div className="counter-div active">
                    <p className="counter-label">Aktív szokások</p>
                    <Target size={32}/>
                    <p className="counter-value">{activeHabitsCount}</p>
                    <p className="counter-desc">Aktív szokások</p>
                </div>
            </div>

            {savedFlash && (
                <div className="saved-flash">Mentés sikeres!</div>
            )}

            <div className="averages-div">
                <div className="explanation-div">
                    <TrendingUp size={20}/>
                    <p className="section-title">Befejezési arány</p>
                </div>
                <p className="section-subtitle">A teljesített feladatok aránya az összes feladatból</p>
                <div className="progress-section">
                    <div className="progress-header">
                        <p>Teljesítés</p>
                        <p className="progress-percent">{completionRate}%</p>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{width: `${completionRate}%`}}></div>
                    </div>
                </div>
                <div className="ratio-div">
                    <div className="completed-div">
                        <p>Befejezett</p>
                        <p className="ratio-value">{statsObj?.completedActivities || 0}</p>
                    </div>
                    <div className="pending-div">
                        <p>Függőben lévő</p>
                        <p className="ratio-value">{pending}</p>
                    </div>
                </div>
            </div>
            <div className="stats-grid">
                <div className="priority-stats-div">
                    <div className="explanation-div">
                        <Activity size={20}/>
                        <p className="section-title">Nehézségek eloszlása</p>
                    </div>
                    <div className="priority-item high-difficulty">
                        <p>Magas nehézség</p>
                        <p className="priority-value">{statsObj?.hardTasks || 0}</p>
                    </div>
                    <div className="priority-item mid-difficulty">
                        <p>Közepes nehézség</p>
                        <p className="priority-value">{statsObj?.middleTasks || 0}</p>
                    </div>
                    <div className="priority-item low-difficulty">
                        <p>Alacsony nehézség</p>
                        <p className="priority-value">{statsObj?.easyTasks || 0}</p>
                    </div>
                </div>
                <div className="habit-stats-div">
                    <div className="explanation-div">
                        <Target size={20}/>
                        <p className="section-title">Heti összesítő</p>
                    </div>
                    <div className="habit-counter-display">
                        <p>Heti összes feladat</p>
                        <p className="habit-value">{weeklyTotal}</p>
                    </div>
                    <div className="habit-counter-display">
                        <p>Heti befejezett</p>
                        <p className="habit-value">{weeklyCompleted}</p>
                    </div>
                    <div className="habit-counter-display">
                        <p>Heti függőben</p>
                        <p className="habit-value">{weeklyTotal - weeklyCompleted}</p>
                    </div>
                    <div className="habit-average-display">
                        <p>Napi átlag</p>
                        <p className="habit-avg-value">{weeklyAverage}</p>
                    </div>
                </div>
            </div>
            
            <div className="weekly-overview-div">
                <div className="explanation-div">
                    <p className="section-title">Heti áttekintés</p>
                </div>
                <p className="section-subtitle">Heti teljesítmény összefoglaló</p>

                <div className="diagram-div">
                    <div className="chart-container">
                        <div className="y-axis">
                            {(() => {
                                const raw = [maxValue, Math.round(maxValue * 0.75), Math.round(maxValue * 0.5), Math.round(maxValue * 0.25), 0];
                                const unique = [...new Set(raw)];
                                return unique.map((value, index) => (
                                    <span key={index} className="y-axis-label">{value}</span>
                                ));
                            })()}
                        </div>
                        <div className="chart-content">
                            {weekData.map((data, index) => {
                                const completedHeight = maxValue > 0 ? (data.completed / maxValue) * 100 : 0;
                                const pendingHeight = maxValue > 0 ? (data.pending / maxValue) * 100 : 0;
                                
                                return (
                                    <div key={index} className="chart-bar-group">
                                        <div className="chart-bars">
                                            <div 
                                                className="chart-bar completed" 
                                                style={{height: `${completedHeight}%`}}
                                            ></div>
                                            <div 
                                                className="chart-bar pending" 
                                                style={{height: `${pendingHeight}%`}}
                                            ></div>
                                        </div>
                                        <p className="chart-label">{data.day}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="chart-legend">
                        <div className="legend-item">
                            <span className="legend-color completed"></span>
                            <p>Elvégzett</p>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color pending"></span>
                            <p>Függőben</p>
                        </div>
                    </div>
                </div>
                <div className="diagram-counters-div">
                    <div className="weekly-stat-display">
                        <p>Heti összes</p>
                        <p className="weekly-value">{weeklyTotal}</p>
                    </div>
                    <div className="weekly-stat-display">
                        <p>Elvégzett</p>
                        <p className="weekly-value">{weeklyCompleted}</p>
                    </div>
                    <div className="weekly-stat-display">
                        <p>Átlag / nap</p>
                        <p className="weekly-value">{weeklyAverage}</p>
                    </div>
                </div>
            </div>
        </section>
    )
}