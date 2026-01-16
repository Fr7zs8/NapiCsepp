import "./daily.css"
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom'
import { useState } from "react";

export function DailyView(){
    const navigate = useNavigate();

    const [currentDay, setCurrentDay] = useState(new Date());

    const changeDay = (direction) => {
        setCurrentDay(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + direction);
            return newDate;
        });
    };

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 0; hour < 24; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        return slots;
    };
    
    const timeSlots = generateTimeSlots();

    const dateString = currentDay.toLocaleDateString('hu-HU', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    return(
        <section className="day-calendar-section">
            <div className="header-div">
                <div className="navigation-buttons">
                    <button onClick={() => navigate("/")}>Vissza</button>
                    <button onClick={() => changeDay(-1)}><ArrowLeft size={20}/></button>
                    <button onClick={() => changeDay(1)}><ArrowRight size={20}/></button>
                </div>
                <div className="info-text-div">
                    <p>{dateString}</p>
                </div>
                <div className="view-switch-div">
                    <div className="view-switch-small">
                        <input type="radio" id="view-month" name="view"/>
                        <label htmlFor="view-month" onClick={() => navigate("/calendar/monthly")}>Hónap</label>
                        
                        <input type="radio" id="view-week" name="view"/>
                        <label htmlFor="view-week" onClick={() => navigate("/calendar/weekly")}>Hét</label>
                        
                        <input type="radio" id="view-day" name="view" defaultChecked/>
                        <label htmlFor="view-day" onClick={() => navigate("/calendar/daily")}>Nap</label>
                        
                        <span className="switch-slider"></span>
                    </div>
                </div>
            </div>
            <div className="hour-list-div">
                {timeSlots.map((time, index) => (
                    <div key={index} className="hour-slot">
                        <span className="time-label">{time}</span>
                        <div className="time-content"></div>
                    </div>
                ))}
            </div>
        </section>
    )
}