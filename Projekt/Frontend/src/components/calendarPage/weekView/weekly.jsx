import "./weekly.css"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useState } from "react";
import { useNavigate } from 'react-router-dom'

export function WeeklyView(){
    const navigate = useNavigate();
    const [currentWeek, setCurrentWeek] = useState(new Date());

    const changeWeek = (direction) => {
        setCurrentWeek(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + (direction * 7));
            return newDate;
        });
    };
    
    const generateWeekDays = () => {
        const days = [];
        const startOfWeek = new Date(currentWeek);
        
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            days.push({
                dayName: ['hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat', 'vasárnap'][i],
                date: date.getDate(),
                isWeekend: i >= 5
            });
        }
        
        return days;
    };
    
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 0; hour < 24; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        return slots;
    };
    
    const weekDays = generateWeekDays();
    const timeSlots = generateTimeSlots();

        const monthName = currentWeek.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' });


    return(
        <section>
            <div className="weekly-calendar-view">
                <div className="header-div">
                    <div className="navigation-buttons">
                        <button onClick={() => navigate("/")}>Vissza</button>
                        <button onClick={() => changeWeek(-1)}><ArrowLeft size={20}/></button>
                        <button onClick={() => changeWeek(1)}><ArrowRight size={20}/></button>
                    </div>
                    <div className="info-text-div">
                        <p>{monthName}</p>
                    </div>
                    <div className="view-switch-div">
                        <div className="view-switch-small">
                            <input type="radio" id="view-month" name="view"/>
                            <label htmlFor="view-month" onClick={() => navigate("/calendar/monthly")}>Hónap</label>
                            
                            <input type="radio" id="view-week" name="view" checked readOnly/>
                            <label htmlFor="view-week" onClick={() => navigate("/calendar/weekly")}>Hét</label>
                            
                            <input type="radio" id="view-day" name="view"/>
                            <label htmlFor="view-day" onClick={() => navigate("/calendar/daily")}>Nap</label>
                            
                            <span className="switch-slider"></span>
                        </div>
                    </div>
                </div>
                <div className="weekly-view-div">
                    <div className="week-grid">
                        <div className="time-column">
                            <div className="day-header-cell"></div>
                            {timeSlots.map((time, index) => (
                                <div key={index} className="time-cell">{time}</div>
                            ))}
                        </div>
                        {weekDays.map((day, dayIndex) => (
                            <div key={dayIndex} className="day-column">
                                <div className={`day-header-cell ${day.isWeekend ? 'weekend' : ''}`}>
                                    <span className="day-name">{day.dayName}</span>
                                    <span className="day-date">{day.date}</span>
                                </div>
                                {timeSlots.map((_, timeIndex) => (
                                    <div key={timeIndex} className={`hour-cell ${day.isWeekend ? 'weekend' : ''}`}></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}