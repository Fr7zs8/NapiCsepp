import "./weekly.css"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { EventPopup } from "../../../components/EventPopup/EventPopup";
import { activityService } from "../../../router/apiRouter";

export function WeeklyView(){
    const navigate = useNavigate();
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedHour, setSelectedHour] = useState(null);
    const [events, setEvents] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);


    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const eventsData = await activityService.getAllEvents();
            setEvents(eventsData || []);
        } catch (err) {
            console.error("Error fetching events:", err);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const wasMobile = isMobile;
            const currentlyMobile = window.innerWidth <= 900;

            if (wasMobile !== currentlyMobile) {
                setIsMobile(currentlyMobile);
                navigate('/calendar/monthly');
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);

    }, [isMobile, navigate]);

    const changeWeek = (direction) => {
        setCurrentWeek(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + (direction * 7));
            return newDate;
        });
    };

    const handleCellClick = (date, hour) => {
        setSelectedDate(date);
        setSelectedHour(hour);
        setShowEventPopup(true);
    };

    const handleSaveEvent = async (eventData) => {
        try {
            await activityService.createEvent(eventData);
            fetchEvents();
        } catch (err) {
            console.error("Error creating event:", err);
            alert("Hiba történt az esemény létrehozása során!");
        }
    };

    const getEventsForCell = (date, hour) => {
        const dateStr = date.toISOString().split('T')[0];
        return events.filter(event => {
            const startTime = new Date(event.event_start_time);
            const endTime = new Date(event.event_end_time);
            const eventDateStr = startTime.toISOString().split('T')[0];
            if (eventDateStr !== dateStr) return false;
            const startHour = startTime.getHours();
            const endHour = endTime.getHours();
            const endMinutes = endTime.getMinutes();
            return hour >= startHour && (hour < endHour || (hour === endHour && endMinutes === 0));
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
                dayName: ['hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat', 'vasárnap'][i],
                date: date.getDate(),
                fullDate: date,
                isWeekend: i >= 5,
                isToday: isToday
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
                    <div className={`view-switch-small ${isMobile ? 'is-mobile' : ''}`}>
                        <input type="radio" id="view-month" name="view" 
                            checked={window.location.pathname.includes('monthly')} 
                            onChange={() => navigate('/calendar/monthly')} />
                        <label htmlFor="view-month">Hónap</label>

                        <input type="radio" id="view-week" name="view" 
                            checked={window.location.pathname.includes('weekly') || window.location.pathname.includes('combined')} 
                            onChange={ window.location.pathname.includes('combined')?() => navigate('/calendar/combined'):() => navigate('/calendar/weekly')} />
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
                                <div className={`day-header-cell ${day.isWeekend ? 'weekend' : ''} ${day.isToday ? 'current-day' : ''}`}>
                                    <span className="day-name">{day.dayName}</span>
                                    <span className="day-date">{day.date}</span>
                                </div>
                                {timeSlots.map((_, timeIndex) => {
                                    const cellEvents = getEventsForCell(day.fullDate, timeIndex);
                                    return (
                                        <div 
                                            key={timeIndex} 
                                            className={`hour-cell ${day.isWeekend ? 'weekend' : ''}`}
                                            onClick={() => handleCellClick(day.fullDate, timeIndex)}
                                        >
                                            {cellEvents.map((event, eventIdx) => {
                                                const startTime = new Date(event.event_start_time);
                                                const endTime = new Date(event.event_end_time);
                                                const startHour = startTime.getHours();
                                                const endHour = endTime.getHours();
                                                const endMinutes = endTime.getMinutes();
                                                if (timeIndex === startHour) {
                                                    const duration = (endHour - startHour) + (endMinutes / 60);
                                                    const height = duration * 60; 
                                                    return (
                                                        <div
                                                            key={eventIdx}
                                                            className="event-block"
                                                            style={{
                                                                backgroundColor: event.event_color || '#0090ff',
                                                                height: `${height}px`,
                                                                minHeight: '30px'
                                                            }}
                                                        >
                                                            <div className="event-name">{event.event_name}</div>
                                                            <div className="event-time">
                                                                {startTime.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })} - 
                                                                {endTime.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <EventPopup
                isOpen={showEventPopup}
                onClose={() => setShowEventPopup(false)}
                onSave={handleSaveEvent}
                selectedDate={selectedDate}
                selectedHour={selectedHour}
            />
        </section>
    )
}