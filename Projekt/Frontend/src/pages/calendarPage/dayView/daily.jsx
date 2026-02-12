import "./daily.css"
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from "react";
import { activityService } from "../../../router/apiRouter";
import { EventPopup } from "../../../components/EventPopup/EventPopup";

export function DailyView(){
    const navigate = useNavigate();

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const [currentDay, setCurrentDay] = useState(new Date());
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [selectedHour, setSelectedHour] = useState(null);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const handleResize = () => {
            const currentlyMobile = window.innerWidth <= 900;
            if (currentlyMobile !== isMobile) {
                setIsMobile(currentlyMobile);
                navigate('/calendar/monthly');
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile, navigate]);

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

    const changeDay = (direction) => {
        setCurrentDay(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + direction);
            return newDate;
        });
    };

    const handleHourClick = (hour) => {
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

    const getEventsForHour = (hour) => {
        const dateStr = currentDay.toISOString().split('T')[0];
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

    const today = new Date();
    const isToday = currentDay.toDateString() === today.toDateString();

    return(
        <section className="day-calendar-section">
            <div className="header-div">
                <div className="navigation-buttons">
                    <button onClick={() => navigate("/")}>Vissza</button>
                    <button onClick={() => changeDay(-1)}><ArrowLeft size={20}/></button>
                    <button onClick={() => changeDay(1)}><ArrowRight size={20}/></button>
                </div>
                <div className={`info-text-div ${isToday ? 'current-day' : ''}`}>
                    <p>{dateString}</p>
                </div>
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
            <div className="hour-list-div">
                {timeSlots.map((time, index) => {
                    const hourEvents = getEventsForHour(index);
                    return (
                        <div key={index} className="hour-slot" onClick={() => handleHourClick(index)}>
                            <span className="time-label">{time}</span>
                            <div className="time-content">
                                {hourEvents.map((event, eventIdx) => {
                                    const startTime = new Date(event.event_start_time);
                                    const endTime = new Date(event.event_end_time);
                                    const startHour = startTime.getHours();
                                    if (index === startHour) {
                                        return (
                                            <div
                                                key={eventIdx}
                                                className="event-block-daily"
                                                style={{
                                                    backgroundColor: event.event_color || '#0090ff'
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
                        </div>
                    );
                })}
            </div>

            <EventPopup
                isOpen={showEventPopup}
                onClose={() => setShowEventPopup(false)}
                onSave={handleSaveEvent}
                selectedDate={currentDay}
                selectedHour={selectedHour}
            />
        </section>
    )
}