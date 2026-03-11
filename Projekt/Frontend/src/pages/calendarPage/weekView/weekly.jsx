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

    const handleCellClick = (date, minuteOfDay, e) => {
        const cellEvents = getEventsForMinute(date, minuteOfDay);
        if (cellEvents.length > 0) {
            setMiniPopup({ show: true, event: cellEvents[0], position: { x: e.clientX, y: e.clientY } });
        } else {
            setSelectedDate(date);
            setSelectedHour(Math.floor(minuteOfDay / 60));
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

    const localDateStr = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const getEventsForMinute = (date, minuteOfDay) => {
        const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return events.filter(event => {
            const startTime = new Date(event.event_start_time);
            const endTime = new Date(event.event_end_time);
            const startDay = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());
            const endDay = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate());
            if (targetDay < startDay || targetDay > endDay) return false;
            const startMinute = startTime.getHours() * 60 + startTime.getMinutes();
            const endMinute = endTime.getHours() * 60 + endTime.getMinutes();
            const isFirstDay = targetDay.getTime() === startDay.getTime();
            const isLastDay = targetDay.getTime() === endDay.getTime();
            if (isFirstDay && isLastDay) return minuteOfDay >= startMinute && minuteOfDay < endMinute;
            if (isFirstDay) return minuteOfDay >= startMinute;
            if (isLastDay) return minuteOfDay < endMinute;
            return true;
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
                                <div key={`day-${day.date.toISOString()}`} className="day-column" style={{ position: 'relative', height: '1512px' }}>
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
                                                        background: 'transparent',
                                                        zIndex: 2,
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        const minuteOffset = Math.floor(e.clientY - rect.top);
                                                        const minuteOfDay = hour * 60 + Math.max(0, Math.min(59, minuteOffset));
                                                        handleCellClick(day.date, minuteOfDay, e);
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                    {day.events.map((event, eventIdx) => {
                                        const startTime = new Date(event.startTime);
                                        const endTime = new Date(event.endTime);
                                        const startDay = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());
                                        const endDay = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate());
                                        const isMultiDay = startDay.getTime() !== endDay.getTime();

                                        const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
                                        const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
                                        const top = Math.max(startMinutes + 72, 0);
                                        const height = Math.max(endMinutes - startMinutes, 15);

                                        if (isMultiDay) {
                                            const thisDayStart = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
                                            const weekFirstDay = new Date(weekDays[0].date.getFullYear(), weekDays[0].date.getMonth(), weekDays[0].date.getDate());
                                            const isFirstInWeek =
                                                startDay.getTime() === thisDayStart.getTime() ||
                                                (startDay < weekFirstDay && thisDayStart.getTime() === weekFirstDay.getTime());

                                            if (!isFirstInWeek) return null;

                                            let numCols = 0;
                                            for (let i = dayIndex; i < weekDays.length; i++) {
                                                const wd = weekDays[i].date;
                                                const wdDay = new Date(wd.getFullYear(), wd.getMonth(), wd.getDate());
                                                if (wdDay <= endDay) numCols++;
                                                else break;
                                            }

                                            const weekLastDay = new Date(weekDays[6].date.getFullYear(), weekDays[6].date.getMonth(), weekDays[6].date.getDate());
                                            const continuesLeft = startDay < weekFirstDay;
                                            const continuesRight = endDay > weekLastDay;
                                            const rl = continuesLeft ? '0' : '8px';
                                            const rr = continuesRight ? '0' : '8px';
                                            const extraClasses = [
                                                continuesLeft ? 'event-continues-left' : '',
                                                continuesRight ? 'event-continues-right' : '',
                                            ].filter(Boolean).join(' ');

                                            return (
                                                <div
                                                    key={`event-${event.event_id || event.eventId || eventIdx}-${day.date.toISOString()}`}
                                                    className={`event-block event-absolute${extraClasses ? ' ' + extraClasses : ''}`}
                                                    style={{
                                                        top: `${top}px`,
                                                        height: `${height}px`,
                                                        left: '4px',
                                                        right: 'auto',
                                                        width: `calc(${numCols} * 100% - 8px)`,
                                                        backgroundColor: event.event_color || '#0090ff',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        overflow: 'visible',
                                                        zIndex: 10,
                                                        cursor: 'pointer',
                                                        position: 'absolute',
                                                        borderRadius: `${rl} ${rr} ${rr} ${rl}`,
                                                    }}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setMiniPopup({ show: true, event, position: { x: e.clientX, y: e.clientY } });
                                                    }}
                                                >
                                                    <div className="event-name" style={{ overflow: 'hidden', maxWidth: '100%' }}>{event.eventName}</div>
                                                    <div className="event-time" style={{ overflow: 'hidden', maxWidth: '100%' }}>{event.formatTime()}</div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                key={`event-${event.event_id || event.eventId || eventIdx}-${day.date.toISOString()}`}
                                                className="event-block event-absolute"
                                                style={{
                                                    top: `${top}px`,
                                                    height: `${height}px`,
                                                    left: '4px',
                                                    right: '4px',
                                                    width: 'auto',
                                                    backgroundColor: event.event_color || '#0090ff',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    overflow: 'hidden',
                                                    zIndex: 10,
                                                    cursor: 'pointer',
                                                    position: 'absolute'
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