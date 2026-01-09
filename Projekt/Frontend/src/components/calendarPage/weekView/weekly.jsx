import "./weekly.css"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useState } from "react";
import { useNavigate } from 'react-router-dom'

export function WeeklyView(){
    const navigate = useNavigate();
    const [currentWeek] = useState(new Date(2025, 11, 7)); 
    
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


    return(
        <section>
            <div className="weekly-calendar-view">
                <div className="header-div">
                    <div className="navigation-buttons">
                        <button onClick={() => navigate("/")}>Vissza</button>
                        <button onClick={() => navigate("/calendar/monthly")}>{<ArrowLeft size={20}/>}</button>
                        <button onClick={() => navigate("/calendar/daily")}>{<ArrowRight size={20}/>}</button>
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