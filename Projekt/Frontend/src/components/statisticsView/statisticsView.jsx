import "./statisticsView.css"
import { Calendar, SquareCheckBigIcon, Target, Award, TrendingUp, Activity } from "lucide-react"

export function StatisticsView(){

    const weekData = [
        { day: 'H', completed: 12, pending: 3 },
        { day: 'K', completed: 8, pending: 4 },
        { day: 'Sze', completed: 15, pending: 3 },
        { day: 'Cs', completed: 10, pending: 4 },
        { day: 'P', completed: 14, pending: 1 },
        { day: 'Szo', completed: 6, pending: 2 },
        { day: 'V', completed: 4, pending: 3 }
    ];
    
    const maxValue = Math.max(...weekData.map(d => d.completed + d.pending));

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
                    <p className="counter-value">0</p>
                    <p className="counter-desc">Teendők + Szokások</p>
                </div>
                <div className="counter-div completed">
                    <p className="counter-label">Befejezett</p>
                    <Award size={32}/>
                    <p className="counter-value">0</p>
                    <p className="counter-desc">Elvégzett feladatok</p>
                </div>
                <div className="counter-div events">
                    <p className="counter-label">Összes feladat</p>
                    <Calendar size={32}/>
                    <p className="counter-value">0</p>
                    <p className="counter-desc">Naptári események</p>
                </div>
                <div className="counter-div active">
                    <p className="counter-label">Szokások</p>
                    <Target size={32}/>
                    <p className="counter-value">0</p>
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
                        <p className="progress-percent">0%</p>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{width: '0%'}}></div>
                    </div>
                </div>
                <div className="ratio-div">
                    <div className="completed-div">
                        <p>Befejezett</p>
                        <p className="ratio-value">0</p>
                    </div>
                    <div className="pending-div">
                        <p>Függőben lévő</p>
                        <p className="ratio-value">0</p>
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
                        <p className="priority-value">0</p>
                    </div>
                    <div className="priority-item mid-difficulty">
                        <p>Közepes nehézség</p>
                        <p className="priority-value">0</p>
                    </div>
                    <div className="priority-item low-difficulty">
                        <p>Alacsony nehézség</p>
                        <p className="priority-value">0</p>
                    </div>
                </div>
                <div className="habit-stats-div">
                    <div className="explanation-div">
                        <Target size={20}/>
                        <p className="section-title">Szokások részletei</p>
                    </div>
                    <div className="habit-counter-display">
                        <p>Összes szokás</p>
                        <p className="habit-value">0</p>
                    </div>
                    <div className="habit-counter-display">
                        <p>Aktív szokások</p>
                        <p className="habit-value">0</p>
                    </div>
                    <div className="habit-counter-display">
                        <p>Inaktív szokások</p>
                        <p className="habit-value">0</p>
                    </div>
                    <div className="habit-average-display">
                        <p>Átlagos haladás</p>
                        <p className="habit-avg-value">0%</p>
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
                            {[16, 12, 8, 4, 0].map((value, index) => (
                                <span key={index} className="y-axis-label">{value}</span>
                            ))}
                        </div>
                        <div className="chart-content">
                            {weekData.map((data, index) => {
                                const completedHeight = (data.completed / maxValue) * 100;
                                const pendingHeight = (data.pending / maxValue) * 100;
                                
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
                        <p className="weekly-value">89</p>
                    </div>
                    <div className="weekly-stat-display">
                        <p>Elvégzett</p>
                        <p className="weekly-value">71</p>
                    </div>
                    <div className="weekly-stat-display">
                        <p>Átlag / nap</p>
                        <p className="weekly-value">13</p>
                    </div>
                </div>
            </div>
        </section>
    )
}