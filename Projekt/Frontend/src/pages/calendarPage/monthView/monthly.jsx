import "./monthly.css"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom'
import { activityService } from "../../../router/apiRouter";
import CalendarManager from "../../../classes/Views/calendarManager";
import { EventPopup } from "../../../components/EventPopup/EventPopup";
import { EventMiniPopup } from "../../../components/EventPopup/EventMiniPopup";
import "../../../components/EventPopup/EventMiniPopup.css";
import { AddTaskPopup } from "../../../components/AddTaskPopup/AddTaskPopup";
import { eventService } from "../../../router/apiRouter";
import { showToast } from "../../../components/Toast/showToast";

export function MonthlyView(){
    const navigate = useNavigate();

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [showDayEventsPopup, setShowDayEventsPopup] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [dayEvents, setDayEvents] = useState([]);
    const [dayTasks, setDayTasks] = useState([]);
    const [dayHabits, setDayHabits] = useState([]);
    const [activeTab, setActiveTab] = useState('events');
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
            return { eventsData: eventsData || [], activitiesData: activitiesData || [], habitsData: habitsData || [] };
        } catch (err) {
            console.error("Error fetching data:", err);
            return null;
        }
    };

    const refreshDayTasks = (activitiesData) => {
        if (!selectedDate) return;
        const dateStr = selectedDate.toLocaleDateString('en-CA');
        const tasksForDay = activitiesData.filter(a => {
            const typeName = (a.type_name || '').toLowerCase();
            if (typeName === 'szokás') return false;
            const actDate = a.activity_start_date
                ? new Date(a.activity_start_date).toLocaleDateString('en-CA')
                : null;
            return actDate === dateStr;
        });
        setDayTasks(tasksForDay);
    };

    /* eslint-disable react-hooks/set-state-in-effect */
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

        const targetDay = new Date(dateStr);
        const eventsForDay = events.filter(e => {
            if (!e.event_start_time) return false;
            const startDay = new Date(new Date(e.event_start_time).toLocaleDateString('en-CA'));
            const endDay = e.event_end_time ? new Date(new Date(e.event_end_time).toLocaleDateString('en-CA')) : startDay;
            return targetDay >= startDay && targetDay <= endDay;
        });

        const tasksForDay = activities.filter(a => {
            const typeName = (a.type_name || '').toLowerCase();
            if (typeName === 'szokás') return false;
            const actDate = a.activity_start_date
                ? new Date(a.activity_start_date).toLocaleDateString('en-CA')
                : null;
            return actDate === dateStr;
        });

        const habitsForDay = habits.filter(h => {
            const startDate = h.activity_start_date || h.startDate;
            const endDate = h.activity_end_date || h.endDate;
            if (!startDate) return false;
            try {
                const sd = new Date(startDate + 'T00:00:00');
                const ed = endDate ? new Date(endDate + 'T23:59:59') : sd;
                return clickedDate >= sd && clickedDate <= ed;
            } catch { return false; }
        });

        setDayEvents(eventsForDay);
        setDayTasks(tasksForDay);
        setDayHabits(habitsForDay);
        setActiveTab('events');
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
            console.error(err);
            showToast("Hiba történt az esemény törlésekor!", "error");
        }
    };

    const [editingEvent, setEditingEvent] = useState(null);
    const [showAddTaskPopup, setShowAddTaskPopup] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [taskMiniPopup, setTaskMiniPopup] = useState({ show: false, task: null, position: { x: 0, y: 0 } });

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
            console.error(err);
            showToast("Hiba történt az esemény mentésekor!", "error");
        }
    };

    const handleEventClick = (event, e) => {
        e.stopPropagation();
        setMiniPopup({ show: true, event, position: { x: e.clientX, y: e.clientY } });
    };

    const closeMiniPopup = () => setMiniPopup({ show: false, event: null, position: { x: 0, y: 0 } });

    const taskMiniPopupRef = useRef(null);
    useEffect(() => {
        if (!taskMiniPopup.show) return;
        if (taskMiniPopupRef.current) {
            const rect = taskMiniPopupRef.current.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                taskMiniPopupRef.current.style.left = `${taskMiniPopup.position.x - rect.width}px`;
            }
            if (rect.bottom > window.innerHeight) {
                taskMiniPopupRef.current.style.top = `${taskMiniPopup.position.y - rect.height}px`;
            }
        }
        const handler = (e) => {
            if (taskMiniPopupRef.current && !taskMiniPopupRef.current.contains(e.target)) {
                setTaskMiniPopup({ show: false, task: null, position: { x: 0, y: 0 } });
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [taskMiniPopup.show, taskMiniPopup.position]);

    const handleDeleteTask = async (taskId) => {
        try {
            await activityService.deleteTask(taskId);
            showToast("Feladat sikeresen törölve!", "success");
            setTaskMiniPopup({ show: false, task: null, position: { x: 0, y: 0 } });
            const result = await fetchData();
            if (result) refreshDayTasks(result.activitiesData);
        } catch (err) {
            console.error(err);
            showToast("Hiba történt a feladat törlésekor!", "error");
        }
    };

    // --- Multi-day event helpers ---

    const isSingleDayEvent = (event) => {
        const s = new Date(event.startTime);
        const e = new Date(event.endTime);
        return s.getFullYear() === e.getFullYear() &&
               s.getMonth() === e.getMonth() &&
               s.getDate() === e.getDate();
    };

    const getRawEvent = (event) => {
        const id = event.eventId || event.event_id;
        return events.find(e => (e.event_id || e.eventId) === id) || event;
    };

    const getMultiDayEventLayout = (week) => {
        const seen = new Set();
        const items = [];

        week.forEach((day) => {
            day.events.forEach(event => {
                const id = event.eventId || event.event_id;
                if (seen.has(id)) return;
                if (isSingleDayEvent(event)) return;
                seen.add(id);

                const startDay = new Date(event.startTime);
                startDay.setHours(0, 0, 0, 0);
                const endDay = new Date(event.endTime);
                endDay.setHours(0, 0, 0, 0);

                let startCol = 7, endCol = -1;
                week.forEach((d, idx) => {
                    const dDay = new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getDate());
                    if (dDay >= startDay && dDay <= endDay) {
                        if (idx < startCol) startCol = idx;
                        if (idx > endCol) endCol = idx;
                    }
                });

                if (endCol === -1) return;
                items.push({ event, startCol, endCol });
            });
        });

        // Greedy lane assignment
        const laneEnds = [];
        items.forEach(item => {
            let laneIdx = laneEnds.findIndex(endCol => endCol < item.startCol);
            if (laneIdx === -1) laneIdx = laneEnds.length;
            laneEnds[laneIdx] = item.endCol;
            item.lane = laneIdx;
        });

        return items;
    };

    const calendarDays = calendarManager ? calendarManager.getMonthView(currentMonth, activities, habits) : [];
    const monthName = currentMonth.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' });

    // Pre-compute multi-day event layout per week
    const calendarWeeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
        calendarWeeks.push(calendarDays.slice(i, i + 7));
    }
    const weekLayouts = calendarWeeks.map(week => getMultiDayEventLayout(week));

    // Build lookup: flatIndex -> { bars, numLanes }
    const barsByIndex = calendarDays.map((_, flatIdx) => {
        const wIdx = Math.floor(flatIdx / 7);
        const dIdx = flatIdx % 7;
        const layout = weekLayouts[wIdx] || [];
        const numLanes = layout.length > 0 ? Math.max(...layout.map(e => e.lane)) + 1 : 0;
        const bars = layout
            .filter(item => dIdx >= item.startCol && dIdx <= item.endCol)
            .map(item => ({
                event: item.event,
                lane: item.lane,
                isStart: dIdx === item.startCol,
                isEnd: dIdx === item.endCol,
            }));
        return { bars, numLanes };
    });

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
                        const { bars, numLanes } = barsByIndex[index];
                        const taskCount = day.taskCount || 0;
                        const habitCount = day.habits.length;
                        const singleDayEventCount = day.isCurrentMonth
                            ? day.events.filter(e => isSingleDayEvent(e)).length
                            : 0;
                        const extraPb = numLanes > 0 ? 6 + numLanes * 22 : 0;

                        return (
                            <div
                                key={index}
                                className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isSunday ? 'sunday' : ''} ${day.isToday ? 'current-day' : ''}`}
                                onClick={() => handleDayClick(day.date.getDate(), day.isCurrentMonth)}
                                style={{
                                    cursor: day.isCurrentMonth ? 'pointer' : 'default',
                                    position: 'relative',
                                    paddingBottom: extraPb > 0 ? `${extraPb}px` : undefined,
                                }}
                            >
                                <span className="day-number">{day.date.getDate()}</span>
                                {day.isCurrentMonth && (singleDayEventCount > 0 || taskCount > 0 || habitCount > 0) && (
                                    <div className="day-counters">
                                        {singleDayEventCount > 0 && (
                                            <span className="counter-badge events">🔔 {singleDayEventCount}</span>
                                        )}
                                        {taskCount > 0 && (
                                            <span className="counter-badge tasks">📓 {taskCount}</span>
                                        )}
                                        {habitCount > 0 && (
                                            <span className="counter-badge habits">⭐ {habitCount}</span>
                                        )}
                                    </div>
                                )}
                                {day.isCurrentMonth && bars.map(bar => {
                                    const pos = bar.isStart && bar.isEnd ? 'single'
                                        : bar.isStart ? 'start'
                                        : bar.isEnd ? 'end'
                                        : 'middle';
                                    const rawEvent = getRawEvent(bar.event);
                                    return (
                                        <div
                                            key={`bar-${bar.event.eventId || bar.event.event_id}-${index}`}
                                            className={`event-bar-inline event-bar-${pos}`}
                                            style={{
                                                bottom: `${4 + bar.lane * 22}px`,
                                                backgroundColor: rawEvent.event_color || '#0090ff',
                                            }}
                                            onClick={e => {
                                                e.stopPropagation();
                                                setMiniPopup({ show: true, event: rawEvent, position: { x: e.clientX, y: e.clientY } });
                                            }}
                                        >
                                            {bar.isStart && (
                                                <span className="event-bar-name">🔔 {bar.event.eventName}</span>
                                            )}
                                        </div>
                                    );
                                })}
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
                    <div className="popup-content" onClick={e => e.stopPropagation()}>
                        <div className="popup-header">
                            <h2>{selectedDate?.toLocaleDateString('hu-HU', { month: 'long', day: 'numeric' })}</h2>
                            <button className="close-btn" onClick={() => setShowDayEventsPopup(false)}>×</button>
                        </div>

                        <div className="popup-tabs">
                            <button className={`popup-tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
                                Események {dayEvents.length > 0 && <span className="tab-badge">{dayEvents.length}</span>}
                            </button>
                            <button className={`popup-tab ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
                                Feladatok {dayTasks.length > 0 && <span className="tab-badge">{dayTasks.length}</span>}
                            </button>
                            <button className={`popup-tab ${activeTab === 'habits' ? 'active' : ''}`} onClick={() => setActiveTab('habits')}>
                                Szokások {dayHabits.length > 0 && <span className="tab-badge">{dayHabits.length}</span>}
                            </button>
                        </div>

                        {activeTab === 'events' && (
                            <>
                                <div className="popup-list">
                                    {dayEvents.length === 0 ? (
                                        <p className="popup-empty">Nincs esemény ezen a napon.</p>
                                    ) : (
                                        [...dayEvents]
                                            .sort((a, b) => new Date(a.event_start_time) - new Date(b.event_start_time))
                                            .map(ev => (
                                                <div key={ev.event_id || `${ev.event_name}-${ev.event_start_time}`} className="popup-event-row" onClick={e => handleEventClick(ev, e)}>
                                                    <span>{ev.event_name}</span>
                                                    <span className="popup-event-time">{new Date(ev.event_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(ev.event_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            ))
                                    )}
                                </div>
                                <div className="popup-actions">
                                    <button className="btn-save" onClick={handleAddEvent}>Új esemény hozzáadása</button>
                                </div>
                            </>
                        )}

                        {activeTab === 'tasks' && (
                            <>
                                <div className="popup-list">
                                    {dayTasks.length === 0 ? (
                                        <p className="popup-empty">Nincs feladat ezen a napon.</p>
                                    ) : (
                                        dayTasks.map((task, i) => (
                                            <div
                                                key={task.activity_id || i}
                                                className="popup-item-row"
                                                style={{ cursor: 'pointer' }}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    setTaskMiniPopup({ show: true, task, position: { x: e.clientX, y: e.clientY } });
                                                }}
                                            >
                                                <span className={`popup-status-dot ${(task.activity_achive === 1 || task.activity_achive === true || task.activity_achive === '1') ? 'done' : 'pending'}`}></span>
                                                <span>{task.activity_name}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="popup-actions">
                                    <button className="btn-save" onClick={() => setShowAddTaskPopup(true)}>Új feladat hozzáadása</button>
                                </div>
                            </>
                        )}

                        {activeTab === 'habits' && (
                            <>
                                <div className="popup-list">
                                    {dayHabits.length === 0 ? (
                                        <p className="popup-empty">Nincs szokás ezen a napon.</p>
                                    ) : (
                                        dayHabits.map((habit, i) => (
                                            <div key={habit.activity_id || i} className="popup-item-row">
                                                <span className="popup-status-dot habit"></span>
                                                <span>{habit.activity_name}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="popup-actions">
                                    <span className="popup-link" onClick={() => { navigate('/habits'); setShowDayEventsPopup(false); }}>+ Új szokás hozzáadása</span>
                                </div>
                            </>
                        )}
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
                allEvents={events}
            />

            {taskMiniPopup.show && (
                <div
                    ref={taskMiniPopupRef}
                    className="mini-popup"
                    style={{ top: taskMiniPopup.position.y, left: taskMiniPopup.position.x }}
                    onClick={e => e.stopPropagation()}
                >
                    <button onClick={() => {
                        setEditingTask(taskMiniPopup.task);
                        setTaskMiniPopup({ show: false, task: null, position: { x: 0, y: 0 } });
                        setShowAddTaskPopup(true);
                    }}>Szerkesztés</button>
                    <button onClick={() => handleDeleteTask(taskMiniPopup.task.activity_id)}>Törlés</button>
                    <button onClick={() => setTaskMiniPopup({ show: false, task: null, position: { x: 0, y: 0 } })}>Mégse</button>
                </div>
            )}

            <AddTaskPopup
                isOpen={showAddTaskPopup}
                onClose={() => { setShowAddTaskPopup(false); setEditingTask(null); }}
                onSuccess={async () => { const result = await fetchData(); if (result) refreshDayTasks(result.activitiesData); setEditingTask(null); }}
                selectedDate={selectedDate}
                existingTask={editingTask}
            />
        </section>
    )
}
