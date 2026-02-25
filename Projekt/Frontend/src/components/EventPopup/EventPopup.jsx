import { useState, useEffect } from "react";
import { X } from "lucide-react";
import "./EventPopup.css";
import { showToast } from "../Toast/Toast";

export function EventPopup({ isOpen, onClose, onSave, selectedDate, selectedHour, existingEvent, eventsForDay }) {
    const [eventData, setEventData] = useState({
        event_name: "",
        event_date: "",
        event_start_time: "",
        event_end_time: ""
    });

    useEffect(() => {
        if (isOpen) {
            if (existingEvent) {
                // Support both API and Event class field names
                const startRaw = existingEvent.event_start_time || existingEvent.startTime;
                const endRaw = existingEvent.event_end_time || existingEvent.endTime;
                const nameRaw = existingEvent.event_name || existingEvent.eventName || "";
                const startDateTime = new Date(startRaw);
                const endDateTime = new Date(endRaw);
                setEventData({
                    event_name: nameRaw,
                    event_date: !isNaN(startDateTime) ? startDateTime.toISOString().split('T')[0] : "",
                    event_start_time: !isNaN(startDateTime) ? startDateTime.toTimeString().slice(0, 5) : "",
                    event_end_time: !isNaN(endDateTime) ? endDateTime.toTimeString().slice(0, 5) : ""
                });
            } else {
                const date = selectedDate ? new Date(selectedDate) : new Date();
                // Use local date string (YYYY-MM-DD) to avoid UTC offset issues
                const dateStr = date.toLocaleDateString('en-CA');
                let startTime = "09:00";
                let endTime = "10:00";
                if (selectedHour !== undefined && selectedHour !== null) {
                    startTime = `${selectedHour.toString().padStart(2, '0')}:00`;
                    endTime = `${(selectedHour + 1).toString().padStart(2, '0')}:00`;
                }
                setEventData({
                    event_name: "",
                    event_date: dateStr,
                    event_start_time: startTime,
                    event_end_time: endTime
                });
            }
        }
    }, [isOpen, selectedDate, selectedHour, existingEvent]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!eventData.event_name.trim()) {
            showToast("Kérlek add meg az esemény nevét!", "error");
            return;
        }

        const startDateTime = `${eventData.event_date} ${eventData.event_start_time}`;
        const endDateTime = `${eventData.event_date} ${eventData.event_end_time}`;
        const newStart = new Date(startDateTime);
        const newEnd = new Date(endDateTime);

        // Ellenőrzés: kezdés < befejezés
        if (newStart >= newEnd) {
            showToast("A kezdési időnek korábbinak kell lennie, mint a befejezésnek!", "error");
            return;
        }

        // Ellenőrzés: esemény nem nyúlhat át másik napra
        // Kivétel: ha 00:00-tól 23:59-ig tart ugyanazon a napon, az érvényes
        const startDay = newStart.toISOString().split('T')[0];
        const endDay = newEnd.toISOString().split('T')[0];
        if (startDay !== endDay) {
            showToast("Az esemény nem nyúlhat át több napra!", "error");
            return;
        }

        // Check for overlap with other events on the same day
        if (Array.isArray(eventsForDay)) {
            const overlap = eventsForDay.some(ev => {
                if (existingEvent && ev.event_id === existingEvent.event_id) return false;
                const evStart = new Date(ev.event_start_time);
                const evEnd = new Date(ev.event_end_time);
                // Overlap if: newStart < evEnd && newEnd > evStart
                return newStart < evEnd && newEnd > evStart;
            });
            if (overlap) {
                showToast("Ebben az időzónában már van egy esemény. Kérlek válassz másik időt!", "error");
                return;
            }
        }

        let eventToSave;
        if (existingEvent) {
            eventToSave = {
                event_name: eventData.event_name,
                event_start_time: startDateTime,
                event_end_time: endDateTime
            };
        } else {
            eventToSave = {
                event_name: eventData.event_name,
                event_start_time: startDateTime,
                event_end_time: endDateTime,
                event_color: "#0090ff"
            };
        }

        onSave(eventToSave);
        onClose();
    };

    if (!isOpen) return null;


    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                    <h2>{existingEvent ? "Esemény szerkesztése" : "Új esemény"}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="popup-form">
                    <div className="form-group">
                        <label htmlFor="event-name">Esemény neve *</label>
                        <input
                            type="text"
                            id="event-name"
                            value={eventData.event_name}
                            onChange={(e) => setEventData({ ...eventData, event_name: e.target.value })}
                            placeholder="pl. Mozizás, Találkozó..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="event-date">Dátum *</label>
                        <input
                            type="date"
                            id="event-date"
                            value={eventData.event_date}
                            onChange={(e) => setEventData({ ...eventData, event_date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="start-time">Kezdés *</label>
                            <input
                                type="time"
                                id="start-time"
                                value={eventData.event_start_time}
                                onChange={(e) => setEventData({ ...eventData, event_start_time: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="end-time">Befejezés *</label>
                            <input
                                type="time"
                                id="end-time"
                                value={eventData.event_end_time}
                                onChange={(e) => setEventData({ ...eventData, event_end_time: e.target.value })}
                                required
                            />
                        </div>
                    </div>


                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Mégse
                        </button>
                        <button type="submit" className="btn-save">
                            {existingEvent ? "Mentés" : "Létrehozás"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}