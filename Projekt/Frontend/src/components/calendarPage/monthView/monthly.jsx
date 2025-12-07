import "./monthly.css"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useState } from "react";

export function MonthlyView(){

    const [currentMonth] = useState(new Date(2025, 11));
    
    const daysOfWeek = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'];
    
    
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const firstDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        const days = [];
        
        // Previous month days
        const startDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        for (let i = startDay; i > 0; i--) {
            const prevDate = new Date(year, month, 1 - i);
            days.push({ date: prevDate.getDate(), isCurrentMonth: false, isSunday: false });
        }
        
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dayOfWeek = date.getDay();
            const isSunday = dayOfWeek === 0;
            days.push({ date: i, isCurrentMonth: true, isSunday });
        }
        
        // Next month days - only fill current row, not full week
        const currentLength = days.length;
        const daysInLastRow = currentLength % 7;
        
        if (daysInLastRow !== 0) {
            const remainingDays = 7 - daysInLastRow;
            for (let i = 1; i <= remainingDays; i++) {
                const nextDate = new Date(year, month + 1, i);
                const isSunday = nextDate.getDay() === 0;
                days.push({ date: i, isCurrentMonth: false, isSunday });
            }
        }
        
        return days;
    };
    
    const calendarDays = generateCalendarDays();

    return(
        <section className="monthly-calendar-view">
            <div className="header-div">
                <div className="navigation-buttons">
                    <button>Vissza</button>
                    <button>{<ArrowLeft size={20}/>}</button>
                    <button>{<ArrowRight size={20}/>}</button>
                </div>
                <div className="info-text-div">
                    <p>2025. December</p>
                </div>
                <div className="view-switch-div">
                    <div className="view-switch-small">
                        <input type="radio" id="view-month" name="view" defaultChecked/>
                        <label htmlFor="view-month">Hónap</label>
                        
                        <input type="radio" id="view-week" name="view"/>
                        <label htmlFor="view-week">Hét</label>
                        
                        <input type="radio" id="view-day" name="view"/>
                        <label htmlFor="view-day">Nap</label>
                        
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
                            className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isSunday ? 'sunday' : ''}`}
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