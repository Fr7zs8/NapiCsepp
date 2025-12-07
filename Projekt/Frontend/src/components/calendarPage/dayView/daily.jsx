import "./daily.css"
import { ArrowLeft, ArrowRight } from "lucide-react";

export function DailyView(){

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 0; hour < 24; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        return slots;
    };
    
    const timeSlots = generateTimeSlots();

    return(
        <section className="day-calendar-section">
            <div className="header-div">
                <div className="navigation-buttons">
                    <button>Vissza</button>
                    <button><ArrowLeft size={20}/></button>
                    <button><ArrowRight size={20}/></button>
                </div>
                <div className="info-text-div">
                    <p>2025. november</p>
                </div>
                <div className="view-switch-div">
                    <div className="view-switch-small">
                        <input type="radio" id="view-month" name="view"/>
                        <label htmlFor="view-month">Hónap</label>
                        
                        <input type="radio" id="view-week" name="view"/>
                        <label htmlFor="view-week">Hét</label>
                        
                        <input type="radio" id="view-day" name="view" defaultChecked/>
                        <label htmlFor="view-day">Nap</label>
                        
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