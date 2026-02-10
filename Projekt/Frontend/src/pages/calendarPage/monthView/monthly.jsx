import "./monthly.css"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useState } from "react";
import { useNavigate } from 'react-router-dom'

export function MonthlyView(){
    const navigate = useNavigate();

    const [currentMonth, setCurrentMonth] = useState(new Date());
    
    const daysOfWeek = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'];

    const handleWeeklyNavigation = () => {
        // On mobile, go to combined view (/calendar shows weekly + daily)
        // On desktop, go to weekly view
        if (window.innerWidth <= 600) {
            navigate("/calendar");
        } else {
            navigate("/calendar/weekly");
        }
    };

    const changeMonth = (direction) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };
    
    
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const firstDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        const today = new Date();
        const days = [];
        
        const startDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        for (let i = startDay; i > 0; i--) {
            const prevDate = new Date(year, month, 1 - i);
            days.push({ date: prevDate.getDate(), isCurrentMonth: false, isSunday: false, isToday: false });
        }
        

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dayOfWeek = date.getDay();
            const isSunday = dayOfWeek === 0;
            const isToday = date.toDateString() === today.toDateString();
            days.push({ date: i, isCurrentMonth: true, isSunday, isToday });
        }
        
        const currentLength = days.length;
        const daysInLastRow = currentLength % 7;
        
        if (daysInLastRow !== 0) {
            const remainingDays = 7 - daysInLastRow;
            for (let i = 1; i <= remainingDays; i++) {
                const nextDate = new Date(year, month + 1, i);
                const isSunday = nextDate.getDay() === 0;
                days.push({ date: i, isCurrentMonth: false, isSunday, isToday: false });
            }
        }
        
        return days;
    };
    
    const calendarDays = generateCalendarDays();
    const monthName = currentMonth.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' });

    return(
        <section className="monthly-calendar-view">
            <div className="header-div">
                <div className="navigation-buttons">
                    <button onClick={() => navigate("/")}>Vissza</button>
                    <button onClick={() => changeMonth(-1)}><ArrowLeft size={20}/></button>
                    <button onClick={() => changeMonth(1)}><ArrowRight size={20}/></button>
                </div>
                <div className="info-text-div">
                    <p>{monthName}</p>
                </div>
                <div className="view-switch-div">
                    <div className="view-switch-small">
                        <input type="radio" id="view-month" name="view" checked readOnly/>
                        <label htmlFor="view-month" onClick={() => navigate("/calendar/monthly")}>Hónap</label>
                        
                        <input type="radio" id="view-week" name="view"/>
                        <label htmlFor="view-week" onClick={() => handleWeeklyNavigation()}>Hét</label>
                        
                        <input type="radio" id="view-day" name="view"/>
                        <label htmlFor="view-day" onClick={() => navigate("/calendar/daily")}>Nap</label>
                        
                        <span className="switch-slider"></span>
                    </div>
                </div>
            </div>
            <div className="month-view-div">
                <div className="calendar-grid">
                    {daysOfWeek.map((day, index) => (
                        <div key={index} className={`day-header ${index === 6 ? 'sunday' : ''}`}>
                            {day}
                        </div>
                    ))}
                    {calendarDays.map((day, index) => (
                        <div 
                            key={index} 
                            className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isSunday ? 'sunday' : ''} ${day.isToday ? 'current-day' : ''}`}
                        >
                            {day.date}
                        </div>
                    ))}
                </div>
            </div>
            <div className="explanation-div">
                <p className="explanation-title">Jelmagyarázat</p>
                <div className="legend-items">
                    <div className="legend-item">
                        <span className="legend-color events"></span>
                        <p>Események</p>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color tasks"></span>
                        <p>Teendők (nincs kész)</p>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color partial"></span>
                        <p>Részben kész</p>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color complete"></span>
                        <p>Mind kész</p>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color habits"></span>
                        <p>Szokások</p>
                    </div>
                </div>
            </div>
        </section>
    )
}