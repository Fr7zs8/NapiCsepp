import "./combined.css"
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { eventService } from "../../../router/apiRouter";
import { EventMiniPopup } from "../../../components/EventPopup/EventMiniPopup";
import { EventPopup } from "../../../components/EventPopup/EventPopup";

function EventsListPopup({ events, onClose, date }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }} onClick={onClose}>
            <div style={{ background: 'white', borderRadius: 12, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
                <h2 style={{marginTop:0, marginBottom:16}}>Események: {date && date.toLocaleDateString('hu-HU')}</h2>
                {events.length === 0 ? <div>Nincs esemény.</div> : (
                    <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {events.map((ev, idx) => (
                            <li key={idx} style={{marginBottom:16, background:'#e3f2fd', borderRadius:8, padding:12}}>
                                <div style={{fontWeight:'bold'}}>{ev.event_name}</div>
                                <div>{new Date(ev.event_start_time).toLocaleTimeString('hu-HU',{hour:'2-digit',minute:'2-digit'})} - {new Date(ev.event_end_time).toLocaleTimeString('hu-HU',{hour:'2-digit',minute:'2-digit'})}</div>
                            </li>
                        ))}
                    </ul>
                )}
                <button style={{marginTop:16}} onClick={onClose}>Bezár</button>
            </div>
        </div>
    );
}

export function CombinedView(){
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [events, setEvents] = useState([]);

    const [miniPopupEvent, setMiniPopupEvent] = useState(null);
    const [miniPopupPosition, setMiniPopupPosition] = useState({ x: 0, y: 0 });
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedHour, setSelectedHour] = useState(null);
    const [showEventsList, setShowEventsList] = useState(false);
    const [eventsListForDay, setEventsListForDay] = useState([]);
    const [eventsListDate, setEventsListDate] = useState(null);
    // Mini popup logic
    const [miniPopup, setMiniPopup] = useState({ show: false, event: null, position: { x: 0, y: 0 } });

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

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const data = await eventService.getOverview();
            setEvents(data || []);
        } catch (err) {
            console.error("Error fetching events:", err);
        }
    };

    
    // const handleWeeklyNavigation = () => {
    //     if (window.innerWidth > 600) {
    //         navigate("/calendar/weekly");
    //     }
    // };

    const changeWeek = (direction) => {
        setCurrentWeek(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + (direction * 7));
            return newDate;
        });
    };

    // const changeDay = (direction) => {
    //     setSelectedDay(prev => {
    //         const newDate = new Date(prev);
    //         newDate.setDate(prev.getDate() + direction);
    //         return newDate;
    //     });
    // };
    
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
            const isSelected = date.toDateString() === selectedDay.toDateString();
            days.push({
                dayName: ['H', 'K', 'Sz', 'Cs', 'P', 'Szo', 'V'][i],
                date: date.getDate(),
                isWeekend: i >= 5,
                isToday: isToday,
                isSelected: isSelected,
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
        // Show popup with all events for this day
        const dateStr = new Date(fullDate).toISOString().split('T')[0];
        const dayEvents = events.filter(ev => {
            const evDate = new Date(ev.event_start_time).toISOString().split('T')[0];
            return evDate === dateStr;
        });
        setEventsListForDay(dayEvents);
        setEventsListDate(new Date(fullDate));
        setShowEventsList(true);
    };

    const today = new Date();
    // const isSelectedToday = selectedDay.toDateString() === today.toDateString();

    const getEventsForHour = (hour) => {
        const dateStr = selectedDay.toISOString().split('T')[0];

        return events.filter(event => {
            const start = new Date(event.event_start_time);
            const end = new Date(event.event_end_time);

            const eventDate = start.toISOString().split('T')[0];
            if (eventDate !== dateStr) return false;

            const startHour = start.getHours();
            const endHour = end.getHours();
            const endMinutes = end.getMinutes();

            return hour >= startHour &&
                (hour < endHour || (hour === endHour && endMinutes === 0));
        });
    };


    return(
        <section className="combined-calendar-view">
            {/* Mini popup state */}
            {miniPopupEvent && (
                <EventMiniPopup
                    event={miniPopupEvent}
                    position={miniPopupPosition}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    onClose={() => setMiniPopupEvent(null)}
                />
            )}
            {showEventsList && (
                <EventsListPopup events={eventsListForDay} date={eventsListDate} onClose={() => setShowEventsList(false)} />
            )}
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
                                className={`day-card${day.isWeekend ? ' weekend' : ''}${day.isToday ? ' current-day' : ''}${day.isSelected ? ' selected-day' : ''}`}
                                onClick={() => handleDaySelect(day.fullDate)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="day-name">{day.dayName}</div>
                                <div className="day-date">{day.date}</div>
                            </div>
                        ))}
                    </div>
                </div>

              
                <div className="daily-schedule-div">
                    <div className="schedule-header">
                        {selectedDayString}
                    </div>
                    <div className="time-slots" style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ width: 60, position: 'relative' }}>
                            {timeSlots.map((time, index) => (
                                <div key={index} style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderBottom: '1px solid #e0e0e0', color: '#666', fontSize: '0.9em', paddingRight: 8 }}>
                                    {time}
                                </div>
                            ))}
                        </div>
                        <div style={{ position: "relative", height: `${timeSlots.length * 48}px`, flex: 1 }}>
                            {timeSlots.map((_, index) => {
                                const hour = index;
                                return (
                                    <>
                                        <div
                                            key={`line-${index}`}
                                            style={{
                                                position: "absolute",
                                                top: `${index * 48}px`,
                                                left: 0,
                                                width: "100%",
                                                height: 1,
                                                borderTop: "1px solid #e0e0e0",
                                                zIndex: 1
                                            }}
                                        />
                                        <div
                                            key={`overlay-${index}`}
                                            style={{
                                                position: "absolute",
                                                top: `${index * 48}px`,
                                                left: 0,
                                                width: "100%",
                                                height: "48px",
                                                background: "transparent",
                                                zIndex: 2,
                                                cursor: "pointer"
                                            }}
                                            onClick={e => {
                                                e.stopPropagation();
                                                setEditingEvent(null);
                                                setSelectedHour(hour);
                                                setShowEventPopup(true);
                                            }}
                                        />
                                    </>
                                );
                            })}
                            {events.map((event, i) => {
                                const start = new Date(event.event_start_time);
                                const end = new Date(event.event_end_time);
                                const dateStr = start.toISOString().split('T')[0];
                                if (dateStr !== selectedDay.toISOString().split('T')[0]) return null;
                                const startMinutes = start.getHours() * 60 + start.getMinutes();
                                const endMinutes = end.getHours() * 60 + end.getMinutes();
                                const top = (startMinutes / 60) * 48;
                                const height = Math.max(((endMinutes - startMinutes) / 60) * 48, 15); 
                                return (
                                    <div
                                        key={i}
                                        className="event-block-combined event-absolute"
                                        style={{
                                            backgroundColor: event.event_color || "#2196f3",
                                            position: "absolute",
                                            top: `${top}px`,
                                            height: `${height}px`,
                                            left: '5%',
                                            right: '5%',
                                            zIndex: 2,
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            overflow: "hidden",
                                            width: '90%'
                                        }}
                                        onClick={e => {
                                            e.stopPropagation();
                                            setMiniPopup({ show: true, event, position: { x: e.clientX, y: e.clientY } });
                                        }}
                                    >
                                        <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>{event.event_name}</div>
                                        <div>
                                            {start.toLocaleTimeString('hu-HU',{hour:'2-digit',minute:'2-digit'})}
                                            {" - "}
                                            {end.toLocaleTimeString('hu-HU',{hour:'2-digit',minute:'2-digit'})}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                                <EventPopup
                                    isOpen={showEventPopup}
                                    onClose={() => { setShowEventPopup(false); setEditingEvent(null); }}
                                    onSave={handleSaveEvent}
                                    selectedDate={selectedDay}
                                    selectedHour={selectedHour}
                                    existingEvent={editingEvent}
                                    eventsForDay={events.filter(ev => {
                                        const d = new Date(ev.event_start_time);
                                        return d.toLocaleDateString('en-CA') === selectedDay.toLocaleDateString('en-CA');
                                    })}
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

                </div>
            </div>
        </section>
    )
}