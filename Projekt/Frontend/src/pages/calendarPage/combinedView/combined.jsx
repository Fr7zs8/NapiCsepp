import "./combined.css"
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'


export function CombinedView(){
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date());


    useEffect(() => {
        const handleResize = () => {
            const mobileStatus = window.innerWidth <= 900;
            if (mobileStatus !== isMobile) {
                setIsMobile(mobileStatus);
                navigate('/calendar/monthly');
            }
        };
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
    }, [isMobile, navigate]);
    
    const handleWeeklyNavigation = () => {
        if (window.innerWidth > 600) {
            navigate("/calendar/weekly");
        }
    };

    const changeWeek = (direction) => {
        setCurrentWeek(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + (direction * 7));
            return newDate;
        });
    };

    const changeDay = (direction) => {
        setSelectedDay(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + direction);
            return newDate;
        });
    };
    
    const generateWeekDays = () => {
        const days = [];
        const startOfWeek = new Date(currentWeek);
        
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const isToday = date.toDateString() === today.toDateString();
            days.push({
                dayName: ['H', 'K', 'Sz', 'Cs', 'P', 'Szo', 'V'][i],
                date: date.getDate(),
                isWeekend: i >= 5,
                isToday: isToday,
                fullDate: date
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
    const selectedDayString = selectedDay.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });

    const handleDaySelect = (fullDate) => {
        setSelectedDay(new Date(fullDate));
    };

    const today = new Date();
    const isSelectedToday = selectedDay.toDateString() === today.toDateString();

    return(
        <section className="combined-calendar-view">
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
                    <div className={`view-switch-small ${isMobile ? 'is-mobile' : ''}`}>
                        <input type="radio" id="view-month" name="view" 
                            checked={window.location.pathname.includes('monthly')} 
                            onChange={() => navigate('/calendar/monthly')} />
                        <label htmlFor="view-month">Hónap</label>

                        <input type="radio" id="view-week" name="view" 
                            checked={window.location.pathname.includes('weekly') || window.location.pathname.includes('combined')} 
                            onChange={() => navigate('/calendar/weekly')} />
                        <label htmlFor="view-week">Hét</label>

                        {!isMobile && (
                            <>
                                <input type="radio" id="view-day" name="view" 
                                    checked={window.location.pathname.includes('daily')} 
                                    onChange={() => navigate('/calendar/daily')} />
                                <label htmlFor="view-day">Nap</label>
                            </>
                        )}
                        <div className="switch-slider"></div>
                    </div>
                </div>
            </div>

            <div className="combined-layout">
                {/* Week toggle buttons - left */}
                <div className="week-toggle-div">
                    <button className="week-toggle-btn back" onClick={() => changeWeek(-1)}>
                        ← Előző
                    </button>
                    <button className="week-toggle-btn" onClick={() => navigate("/calendar/weekly")}>
                        Heti nézet
                    </button>
                    <button className="week-toggle-btn back" onClick={() => changeWeek(1)}>
                        Következő →
                    </button>
                </div>

                {/* Weekly overview - center */}
                <div className="weekly-overview-div">
                    <div className="week-grid">
                        {weekDays.map((day, index) => (
                            <div 
                                key={index} 
                                className={`day-card ${day.isWeekend ? 'weekend' : ''} ${day.isToday ? 'current-day' : ''}`}
                                onClick={() => handleDaySelect(day.fullDate)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="day-name">{day.dayName}</div>
                                <div className="day-date">{day.date}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Daily schedule - right */}
                <div className="daily-schedule-div">
                    <div className="schedule-header">
                        {selectedDayString}
                    </div>
                    <div className="time-slots">
                        {timeSlots.map((time, index) => (
                            <div key={index} className="time-slot">
                                {time}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}