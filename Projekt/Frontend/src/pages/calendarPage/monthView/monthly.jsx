import "./monthly.css"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { activityService } from "../../../router/apiRouter";
import CalendarManager from "../../../classes/Views/calendarManager";
import { EventPopup } from "../../../components/EventPopup/EventPopup";
import { EventMiniPopup } from "../../../components/EventPopup/EventMiniPopup";
import { eventService } from "../../../router/apiRouter";
import { showToast } from "../../../components/Toast/Toast";

export function MonthlyView(){
    const navigate = useNavigate();

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [showDayEventsPopup, setShowDayEventsPopup] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [dayEvents, setDayEvents] = useState([]);
    const [miniPopup, setMiniPopup] = useState({ show: false, event: null, position: { x: 0, y: 0 } });
    const [events, setEvents] = useState([]);
    const [activities, setActivities] = useState([]);
    const [habits, setHabits] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const [calendarManager, setCalendarManager] = useState(null);
    
    const daysOfWeek = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'];

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

    

    const fetchData = async () => {
        try {
            const [eventsData, activitiesData, habitsData] = await Promise.all([
                eventService.getOverview(),
                activityService.getAllActivities(),
                activityService.getAllHabits()
            ]);
            setEvents(eventsData || []);
            setActivities(activitiesData || []);
            setHabits(habitsData || []);
            setCalendarManager(new CalendarManager(currentMonth, 'monthly', activitiesData || [], eventsData || []));
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const changeMonth = (direction) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    const handleDayClick = (day, isCurrentMonth) => {
        if (!isCurrentMonth) return;
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const clickedDate = new Date(year, month, day);
        setSelectedDate(clickedDate);
        const dateStr = clickedDate.toLocaleDateString('en-CA');
        const eventsForDay = events.filter(e => {
            const eventDate = new Date(e.event_start_time).toLocaleDateString('en-CA');
            return eventDate === dateStr;
        });
        setDayEvents(eventsForDay);
        setShowDayEventsPopup(true);
    };
    const handleAddEvent = () => {
        setShowDayEventsPopup(false);
        setShowEventPopup(true);
    };

    const handleEditEvent = (event) => {
        setShowDayEventsPopup(false);
        setShowEventPopup(true);
        setEditingEvent(event);
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await eventService.deleteEvent(eventId);
            fetchData();
            showToast("Esemény sikeresen törölve!", "success");
            setMiniPopup({ show: false, event: null, position: { x: 0, y: 0 } });
            setShowDayEventsPopup(false);
        } catch (err) {
            showToast("Hiba történt az esemény törlésekor!", "error");
        }
    };

    const [editingEvent, setEditingEvent] = useState(null);

    const handleSaveEvent = async (eventData) => {
        try {
            if (editingEvent) {
                await eventService.updateEvent(editingEvent.event_id, eventData);
                showToast("Esemény sikeresen módosítva!", "success");
            } else {
                await eventService.createEvent(eventData);
                showToast("Esemény sikeresen létrehozva!", "success");
            }
            fetchData();
            setShowEventPopup(false);
            setEditingEvent(null);
        } catch (err) {
            showToast("Hiba történt az esemény mentésekor!", "error");
        }
    };
    const handleEventClick = (event, e) => {
        e.stopPropagation();
        setMiniPopup({
            show: true,
            event,
            position: { x: e.clientX, y: e.clientY }
        });
    };

    const closeMiniPopup = () => setMiniPopup({ show: false, event: null, position: { x: 0, y: 0 } });

    const calendarDays = calendarManager ? calendarManager.getMonthView(currentMonth, activities, habits) : [];
    const monthName = currentMonth.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' });

    return(
        <section className="monthly-calendar-view">
            <div className="header-div">
                <div className="navigation-buttons">
                    <button onClick={() => navigate("/")}>Vissza</button>
                    <button onClick={() => changeMonth(-1)}><ArrowLeft size={20}/></button>
                    <button onClick={() => changeMonth(1)}><ArrowRight size={20}/></button>
                </div>
                <div className="info-text-div">
                    <p className="month-name">{monthName}</p>
                </div>
                <div className="view-switch-div">
                    <div className={`view-switch-small ${isMobile ? 'is-mobile' : ''}`}>
                        <input type="radio" id="view-month" name="view"
                            checked={window.location.pathname.includes('monthly')}
                            onChange={() => navigate('/calendar/monthly')} />
                        <label htmlFor="view-month">Hónap</label>

                        <input type="radio" id="view-week" name="view"
                            checked={isMobile ? window.location.pathname.includes('combined') : window.location.pathname.includes('weekly')}
                            onChange={() => isMobile ? navigate('/calendar/combined') : navigate('/calendar/weekly')} />
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
            <div className="month-view-div">
                <div className="calendar-grid">
                    {daysOfWeek.map((day, index) => (
                        <div key={index} className={`day-header ${index === 6 ? 'sunday' : ''}`}>
                            {day}
                        </div>
                    ))}
                    {calendarDays.map((day, index) => {
                        const eventCount = day.events.length;
                        const taskCount = day.taskCount || 0;
                        const habitCount = day.habits.length;
                        return (
                            <div
                                key={index}
                                className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isSunday ? 'sunday' : ''} ${day.isToday ? 'current-day' : ''}`}
                                onClick={() => handleDayClick(day.date.getDate(), day.isCurrentMonth)}
                                style={{ cursor: day.isCurrentMonth ? 'pointer' : 'default' }}
                            >
                                <span className="day-number">{day.date.getDate()}</span>
                                {day.isCurrentMonth && (eventCount > 0 || taskCount > 0 || habitCount > 0) && (
                                    <div className="day-counters">
                                        {eventCount > 0 && (
                                            <span className="counter-badge events">🔔 {eventCount}</span>
                                        )}
                                        {taskCount > 0 && (
                                            <span className="counter-badge tasks">📓 {taskCount}</span>
                                        )}
                                        {habitCount > 0 && (
                                            <span className="counter-badge habits">⭐ {habitCount}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="explanation-div">
                <p className="explanation-title">Jelmagyarázat</p>
                <div className="calendar-legend">
                    <span><span className="counter-badge events"></span> 🔔 Események</span>
                    <span><span className="counter-badge tasks"></span> 📓 Teendők</span>
                    <span><span className="counter-badge habits"></span> ⭐ Szokások</span>
                </div>
            </div>

            {showDayEventsPopup && (
                <div className="popup-overlay" onClick={() => setShowDayEventsPopup(false)}>
                    <div className="popup-content" onClick={e => e.stopPropagation()} style={{ minWidth: 320 }}>
                        <div className="popup-header">
                            <h2>Események ezen a napon</h2>
                            <button className="close-btn" onClick={() => setShowDayEventsPopup(false)}>×</button>
                        </div>
                        <div className="popup-list">
                            {dayEvents.length === 0 ? (
                                <p>Nincs esemény ezen a napon.</p>
                            ) : (
                                [...dayEvents]
                                    .sort((a, b) => new Date(a.event_start_time) - new Date(b.event_start_time))
                                    .map(ev => (
                                        <div key={ev.event_id || `${ev.event_name}-${ev.event_start_time}`} className="popup-event-row" onClick={e => handleEventClick(ev, e)}>
                                            <span>{ev.event_name}</span>
                                            <span style={{ fontSize: '0.9em', color: '#888' }}>{new Date(ev.event_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(ev.event_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    ))
                            )}
                        </div>
                        <div className="popup-actions">
                            <button className="btn-save" onClick={handleAddEvent}>Új esemény hozzáadása</button>
                        </div>
                    </div>
                </div>
            )}

            {miniPopup.show && (
                <EventMiniPopup
                    event={miniPopup.event}
                    position={miniPopup.position}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    onClose={closeMiniPopup}
                />
            )}

            <EventPopup
                isOpen={showEventPopup}
                onClose={() => { setShowEventPopup(false); setEditingEvent(null); }}
                onSave={handleSaveEvent}
                selectedDate={selectedDate}
                existingEvent={editingEvent}
                eventsForDay={dayEvents}
            />
        </section>
    )
}