import "./daily.css"
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from "react";
import CalendarManager from "../../../classes/Views/calendarManager";
import { eventService } from "../../../router/apiRouter";
import { EventPopup } from "../../../components/EventPopup/EventPopup";
import { EventMiniPopup } from "../../../components/EventPopup/EventMiniPopup";

export function DailyView(){
    const navigate = useNavigate();

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const [currentDay, setCurrentDay] = useState(new Date());
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [selectedHour, setSelectedHour] = useState(null);
    const [calendarManager, setCalendarManager] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [miniPopup, setMiniPopup] = useState({ show: false, event: null, position: { x: 0, y: 0 } });

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
            const eventsData = await eventService.getOverview();
            setCalendarManager(new CalendarManager(currentDay, 'daily', [], eventsData || []));
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

    const handleHourClick = (hour, e) => {
        if (!calendarManager) return;
        const dayEvents = calendarManager.getDayView(currentDay).events;
        const cellEvents = dayEvents.filter(event => {
            const startTime = new Date(event.startTime);
            const endTime = new Date(event.endTime);
            const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
            const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
            const slotStart = hour * 60;
            return slotStart >= startMinutes && slotStart < endMinutes;
        });
        if (cellEvents.length > 0) {
            setMiniPopup({ show: true, event: cellEvents[0], position: { x: e.clientX, y: e.clientY } });
        } else {
            setSelectedHour(hour);
            setEditingEvent(null);
            setShowEventPopup(true);
        }
    };

    const handleSaveEvent = async (eventData) => {
        try {
            if (editingEvent) {
                await eventService.updateEvent(editingEvent.event_id, eventData);
            } else {
                await eventService.createEvent(eventData);
            }
            fetchEvents();
            setShowEventPopup(false);
            setEditingEvent(null);
        } catch (err) {
            alert("Hiba történt az esemény mentésekor!");
        }
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setShowEventPopup(true);
        setMiniPopup({ show: false, event: null, position: { x: 0, y: 0 } });
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await eventService.deleteEvent(eventId);
            fetchEvents();
            setMiniPopup({ show: false, event: null, position: { x: 0, y: 0 } });
        } catch (err) {
            alert("Hiba történt az esemény törlésekor!");
        }
    };

    const dayData = calendarManager ? calendarManager.getDayView(currentDay) : { activities: [], events: [] };

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
                        
                    </div>
            </div>
            <div className="day-timeline" style={{ position: 'relative', height: '1440px', width: '100%', margin: '0 auto' }}>
                
                {timeSlots.map((time, idx) => (
                    <>
                        {/* Hour line (border) */}
                        <div key={`line-${time}`} style={{
                            position: 'absolute',
                            top: `${idx * 60}px`,
                            left: 0,
                            width: '100%',
                            height: '1px',
                            borderTop: '1px solid #e5e7eb',
                            zIndex: 1
                        }}>
                            <span style={{ position: 'absolute', left: 0, top: '-10px', width: '80px', color: '#666', fontSize: '0.9rem', background: 'white', zIndex: 2 }}>{time}</span>
                        </div>
                        
                        <div key={`overlay-${time}`} style={{
                            position: 'absolute',
                            top: `${idx * 60}px`,
                            left: 0,
                            width: '100%',
                            height: '60px',
                            background: 'transparent',
                            zIndex: 2,
                            cursor: 'pointer',
                        }}
                            onClick={e => {
                                e.stopPropagation();
                                handleHourClick(idx, e);
                            }}
                        />
                    </>
                ))}
                {dayData.events.map((event, idx) => {
                    const startTime = new Date(event.startTime);
                    const endTime = new Date(event.endTime);
                    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
                    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
                    const top = startMinutes;
                    const height = Math.max(endMinutes - startMinutes, 15); 
                    return (
                        <div
                            key={idx}
                            className="event-block-daily event-absolute"
                            style={{
                                top: `${top}px`,
                                height: `${height}px`,
                                left: '90px',
                                right: '10px',
                                backgroundColor: event.event_color || '#0090ff',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden',
                                zIndex: 10,
                                cursor: 'pointer',
                                position: 'absolute',
                                width: 'calc(100% - 110px)'
                            }}
                            onClick={e => {
                                e.stopPropagation();
                                setMiniPopup({ show: true, event, position: { x: e.clientX, y: e.clientY } });
                            }}
                        >
                            <div className="event-name">{event.eventName}</div>
                            <div className="event-time">
                                {event.formatTime()}
                            </div>
                        </div>
                    );
                })}
            </div>
            <EventPopup
                isOpen={showEventPopup}
                onClose={() => { setShowEventPopup(false); setEditingEvent(null); }}
                onSave={handleSaveEvent}
                selectedDate={currentDay}
                selectedHour={selectedHour}
                existingEvent={editingEvent}
                eventsForDay={dayData.events}
            />
            {miniPopup.show && (
                <EventMiniPopup
                    event={miniPopup.event}
                    position={miniPopup.position}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    onClose={() => setMiniPopup({ show: false, event: null, position: { x: 0, y: 0 } })}
                />
            )}
        </section>
    )
}