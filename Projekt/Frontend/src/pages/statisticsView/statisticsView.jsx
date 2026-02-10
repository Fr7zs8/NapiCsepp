import { useEffect, useState } from "react";
import "./statisticsView.css"
import { Calendar, SquareCheckBigIcon, Target, Award, TrendingUp, Activity, Loader2 } from "lucide-react"
import { clientService } from "../../router/apiRouter";

export function StatisticsView(){

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(()=>{
        fetchStatistics();
    },[])

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const data = await clientService.getStatistics();
            setStats(Array.isArray(data) ? data[0] : data);
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

    const totalTasks = stats.total_activity || 0;
    const completed = stats.completed || 0;
    const pending = totalTasks - completed;
    const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

    const weeklyTotal = stats.weekly_tasks || 0;
    const weeklyCompleted = stats.weekly_tasks_completed || 0;
    const weeklyAverage = weeklyTotal > 0 ? Math.round(weeklyTotal / 7) : 0;

    const weekData = [
        { day: 'H', completed: Math.floor(weeklyCompleted / 7), pending: Math.floor((weeklyTotal - weeklyCompleted) / 7) },
        { day: 'K', completed: Math.floor(weeklyCompleted / 7), pending: Math.floor((weeklyTotal - weeklyCompleted) / 7) },
        { day: 'Sze', completed: Math.floor(weeklyCompleted / 7), pending: Math.floor((weeklyTotal - weeklyCompleted) / 7) },
        { day: 'Cs', completed: Math.floor(weeklyCompleted / 7), pending: Math.floor((weeklyTotal - weeklyCompleted) / 7) },
        { day: 'P', completed: Math.floor(weeklyCompleted / 7), pending: Math.floor((weeklyTotal - weeklyCompleted) / 7) },
        { day: 'Szo', completed: Math.floor(weeklyCompleted / 7), pending: Math.floor((weeklyTotal - weeklyCompleted) / 7) },
        { day: 'V', completed: Math.floor(weeklyCompleted / 7), pending: Math.floor((weeklyTotal - weeklyCompleted) / 7) }
    ];
    
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
                    <p className="counter-value">{totalTasks}</p>
                    <p className="counter-desc">Teendők + Szokások</p>
                </div>
                <div className="counter-div completed">
                    <p className="counter-label">Befejezett</p>
                    <Award size={32}/>
                    <p className="counter-value">{completed}</p>
                    <p className="counter-desc">Elvégzett feladatok</p>
                </div>
                <div className="counter-div events">
                    <p className="counter-label">Összes feladat</p>
                    <Calendar size={32}/>
                    <p className="counter-value">{stats.monthly_events_count || 0}</p>
                    <p className="counter-desc">Naptári események</p>
                </div>
                <div className="counter-div active">
                    <p className="counter-label">Mai feladatok</p>
                    <Target size={32}/>
                    <p className="counter-value">{stats.daily_tasks_count || 0}</p>
                    <p className="counter-desc">Aktív szokások</p>
                </div>
            </div>

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
                        <p className="ratio-value">{completed}</p>
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
                        <p className="section-title">Prioritások eloszlása</p>
                    </div>
                    <div className="priority-item high-difficulty">
                        <p>Magas nehézség</p>
                        <p className="priority-value">{stats.hard_tasks || 0}</p>
                    </div>
                    <div className="priority-item mid-difficulty">
                        <p>Közepes nehézség</p>
                        <p className="priority-value">{stats.middle_tasks || 0}</p>
                    </div>
                    <div className="priority-item low-difficulty">
                        <p>Alacsony nehézség</p>
                        <p className="priority-value">{stats.easy_tasks || 0}</p>
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
                            {[maxValue, Math.floor(maxValue * 0.75), Math.floor(maxValue * 0.5), Math.floor(maxValue * 0.25), 0].map((value, index) => (
                                <span key={index} className="y-axis-label">{value}</span>
                            ))}
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