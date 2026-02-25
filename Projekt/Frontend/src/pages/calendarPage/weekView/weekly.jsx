import "./weekly.css"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react";
import CalendarManager from "../../../classes/Views/calendarManager";
import { useNavigate } from 'react-router-dom'
import { EventPopup } from "../../../components/EventPopup/EventPopup";
import { EventMiniPopup } from "../../../components/EventPopup/EventMiniPopup";
import { eventService } from "../../../router/apiRouter";
import { showToast } from "../../../components/Toast/showToast";


export function WeeklyView(){
    const navigate = useNavigate();
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedHour, setSelectedHour] = useState(null);
    const [events, setEvents] = useState([]);
    const [calendarManager, setCalendarManager] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const [editingEvent, setEditingEvent] = useState(null);
    const [miniPopup, setMiniPopup] = useState({ show: false, event: null, position: { x: 0, y: 0 } });

    const fetchEvents = async () => {
        try {
            const eventsData = await eventService.getOverview();
            setEvents(eventsData || []);
            setCalendarManager(new CalendarManager(currentWeek, 'weekly', [], eventsData || []));
        } catch (err) {
            console.error("Error fetching events:", err);
        }
    };

    /* eslint-disable react-hooks/set-state-in-effect */
    // Initial fetch: this calls async fetchEvents which updates state; intentional for initial load
    useEffect(() => {
        fetchEvents();
    }, []);

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

    const handleCellClick = (date, hour, e) => {
        const cellEvents = getEventsForCell(date, hour);
        if (cellEvents.length > 0) {
            setMiniPopup({ show: true, event: cellEvents[0], position: { x: e.clientX, y: e.clientY } });
        } else {
            setSelectedDate(date);
            setSelectedHour(hour);
            setEditingEvent(null);
            setShowEventPopup(true);
        }
    };

    const handleSaveEvent = async (eventData) => {
        try {
            if (editingEvent) {
                await eventService.updateEvent(editingEvent.event_id || editingEvent.eventId, eventData);
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
            let id = eventId;
            if (typeof eventId === 'object') {
                id = eventId.event_id || eventId.eventId;
            }
            if (!id || isNaN(Number(id))) {
                showToast("Hibás esemény azonosító!", "error");
                return;
            }
            await eventService.deleteEvent(Number(id));
            fetchEvents();
            showToast("Esemény sikeresen törölve!", "success");
            setMiniPopup({ show: false, event: null, position: { x: 0, y: 0 } });
        } catch (err) {
            if (err && err.message) {
                showToast("Hiba történt az esemény törlésekor: " + err.message, "error");
            } else {
                showToast("Hiba történt az esemény törlésekor!", "error");
            }
            console.error("Delete event error:", err);
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

    const weekDays = calendarManager ? calendarManager.getWeekView(currentWeek, selectedDate) : [];

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 0; hour < 24; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        return slots;
    };

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
                        {weekDays.map((day, dayIndex) => {
                            return (
                                <div key={`day-${day.date.toISOString()}`} className="day-column" style={{ position: 'relative', height: '1440px' }}>
                                    <div className={`day-header-cell${day.isToday ? ' current-day' : ''}${day.isSelected ? ' selected-day' : ''}`}>
                                        <span className="day-name">{day.date.toLocaleDateString('hu-HU', { weekday: 'long' })}</span>
                                        <span className="day-date">{day.date.getDate()}</span>
                                    </div>
                                    {timeSlots.map((_, timeIndex) => {
                                        const hour = timeIndex;
                                        const isLastRow = timeIndex === timeSlots.length - 1;
                                        const isLastCol = dayIndex === weekDays.length - 1;
                                        const isFirstCol = dayIndex === 0;
                                        return (
                                            <div
                                                key={`cell-${day.date.toISOString()}-${timeIndex}`}
                                                style={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    borderRight: isLastRow || isLastCol ? '1px solid #e5e7eb' : 'none',
                                                    borderLeft: isLastRow || isFirstCol ? '1px solid #e5e7eb' : 'none',
                                                    borderBottom: isLastRow ? '1px solid #e5e7eb' : 'none',
                                                    background: isLastRow ? '#fff' : 'transparent',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: `${hour * 60}px`,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '1px',
                                                        borderTop: '1px solid #e5e7eb',
                                                        zIndex: 1
                                                    }}
                                                />
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: `${hour * 60}px`,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '60px',
                                                        background: isLastRow ? '#fff' : 'transparent',
                                                        borderBottom: isLastRow ? '1px solid #e5e7eb' : 'none',
                                                        borderTop: isLastRow ? '1px solid #e5e7eb' : 'none',
                                                        borderLeft: isLastRow ? '1px solid #e5e7eb' : 'none',
                                                        zIndex: 2,
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        handleCellClick(day.date, hour, e);
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                    {day.events.map((event, eventIdx) => {
                                        const startTime = new Date(event.startTime);
                                        const endTime = new Date(event.endTime);
                                        const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
                                        const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
                                        const top = Math.max(startMinutes + 60, 0);
                                        const height = Math.max(endMinutes - startMinutes, 15);
                                        return (
                                            <div
                                                key={`event-${event.event_id || event.eventId || eventIdx}-${day.date.toISOString()}`}
                                                className="event-block event-absolute"
                                                style={{
                                                    top: `${top}px`,
                                                    height: `${height}px`,
                                                    left: '5%',
                                                    right: '5%',
                                                    backgroundColor: event.event_color || '#0090ff',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    overflow: 'hidden',
                                                    zIndex: 10,
                                                    cursor: 'pointer',
                                                    position: 'absolute',
                                                    width: '90%'
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
                            );
                        })}
                        
                    </div>
                </div>
            </div>

            <EventPopup
                isOpen={showEventPopup}
                onClose={() => { setShowEventPopup(false); setEditingEvent(null); }}
                onSave={handleSaveEvent}
                selectedDate={selectedDate}
                selectedHour={selectedHour}
                existingEvent={editingEvent}
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