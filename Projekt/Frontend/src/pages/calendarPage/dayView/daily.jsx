import React from "react";
import "./daily.css"
import { getEventColor } from "../../../utils/eventColors";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from "react";
import CalendarManager from "../../../classes/Views/calendarManager";
import { eventService } from "../../../router/apiRouter";
import { EventPopup } from "../../../components/EventPopup/EventPopup";
import { EventMiniPopup } from "../../../components/EventPopup/EventMiniPopup";
import { showToast } from "../../../components/Toast/showToast";

export function DailyView(){
    const navigate = useNavigate();

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const [currentDay, setCurrentDay] = useState(new Date());
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [selectedHour, setSelectedHour] = useState(null);
    const [calendarManager, setCalendarManager] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [miniPopup, setMiniPopup] = useState({ show: false, event: null, position: { x: 0, y: 0 } });
    const [futureEvents, setFutureEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);

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

    const fetchEvents = async () => {
        try {
            const eventsData = await eventService.getOverview();
            setAllEvents(eventsData || []);
            setCalendarManager(new CalendarManager(currentDay, 'daily', [], eventsData || []));
            const now = new Date();
            setFutureEvents(
                (eventsData || [])
                    .filter(e => new Date(e.event_start_time) > now)
                    .sort((a, b) => new Date(a.event_start_time) - new Date(b.event_start_time))
            );
        } catch (err) {
            console.error("Error fetching events:", err);
        }
    };

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        fetchEvents();
    }, []);

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
                showToast("Esemény sikeresen módosítva!", "success");
            } else {
                await eventService.createEvent(eventData);
                showToast("Esemény sikeresen létrehozva!", "success");
            }
            fetchEvents();
            setShowEventPopup(false);
            setEditingEvent(null);
        } catch (err) {
            console.error(err);
            showToast("Hiba történt az esemény mentésekor!", "error");
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
            showToast("Esemény sikeresen törölve!", "success");
            setMiniPopup({ show: false, event: null, position: { x: 0, y: 0 } });
        } catch (err) {
            console.error(err);
            showToast("Hiba történt az esemény törlésekor!", "error");
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
        <div className="daily-page-wrapper">
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

            <div className="daily-main-content">
                <section className="day-calendar-section">
                    <div className="day-timeline-scroll">
                        <div className="day-timeline" style={{ position: 'relative', height: '1440px', width: '100%', margin: '0 auto' }}>
                            {timeSlots.map((time, idx) => (
                                <React.Fragment key={`slot-${idx}`}>
                                    <div style={{
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
                                    <div style={{
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
                                </React.Fragment>
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
                                        <div className="event-time">{event.formatTime()}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <aside className="daily-future-panel">
                    <div className="daily-future-panel-header">
                        <Clock size={16} className="daily-future-icon" />
                        <h4>Közelgő események</h4>
                    </div>
                    <div className="daily-future-list">
                        {futureEvents.length === 0 ? (
                            <p className="daily-future-empty">Nincsenek közelgő események.</p>
                        ) : (
                            futureEvents.map((ev, i) => {
                                    const start = new Date(ev.event_start_time);
                                    const end = new Date(ev.event_end_time || ev.endTime || ev.end_time);
                                    return (
                                        <div key={ev.event_id} className="daily-future-item" style={{ '--event-color': getEventColor(ev, i) }} onClick={(e) => {
                                            e.stopPropagation();
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setMiniPopup({ show: true, event: ev, position: { x: rect.right - 160, y: rect.top + 8 } });
                                        }}>
                                            <div className="daily-future-dot"></div>
                                            <div className="daily-future-info">
                                                <span className="daily-future-name">{ev.event_name}</span>
                                                <span className="daily-future-time">
                                                    {start.toLocaleDateString('hu-HU', { month: 'long', day: 'numeric' })}
                                                    {' · '}
                                                    {start.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                                                    {(!isNaN(end) ? (` — ${end.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}`) : '')}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </aside>
            </div>

            <EventPopup
                isOpen={showEventPopup}
                onClose={() => { setShowEventPopup(false); setEditingEvent(null); }}
                onSave={handleSaveEvent}
                selectedDate={currentDay}
                selectedHour={selectedHour}
                existingEvent={editingEvent}
                allEvents={allEvents}
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
        </div>
    )
}