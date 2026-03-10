import { useState, useEffect } from "react";
/* eslint-disable react-hooks/set-state-in-effect */
import { X } from "lucide-react";
import "./EventPopup.css";
import { showToast } from "../Toast/showToast";

export function EventPopup({ isOpen, onClose, onSave, selectedDate, selectedHour, existingEvent, eventsForDay }) {
    const [eventData, setEventData] = useState({
        event_name: "",
        event_start_date: "",
        event_end_date: "",
        event_start_time: "",
        event_end_time: ""
    });

    useEffect(() => {
        if (isOpen) {
            if (existingEvent) {
                const startRaw = existingEvent.event_start_time || existingEvent.startTime;
                const endRaw = existingEvent.event_end_time || existingEvent.endTime;
                const nameRaw = existingEvent.event_name || existingEvent.eventName || "";
                const startDT = new Date(startRaw);
                const endDT = new Date(endRaw);
                setEventData({
                    event_name: nameRaw,
                    event_start_date: !isNaN(startDT) ? startDT.toLocaleDateString('en-CA') : "",
                    event_end_date: !isNaN(endDT) ? endDT.toLocaleDateString('en-CA') : "",
                    event_start_time: !isNaN(startDT) ? startDT.toTimeString().slice(0, 5) : "",
                    event_end_time: !isNaN(endDT) ? endDT.toTimeString().slice(0, 5) : ""
                });
            } else {
                const date = selectedDate ? new Date(selectedDate) : new Date();
                const dateStr = date.toLocaleDateString('en-CA');
                let startTime = "08:00";
                let endTime = "09:00";
                if (selectedHour !== undefined && selectedHour !== null) {
                    startTime = `${selectedHour.toString().padStart(2, '0')}:00`;
                    endTime = `${(selectedHour + 1).toString().padStart(2, '0')}:00`;
                }
                setEventData({
                    event_name: "",
                    event_start_date: dateStr,
                    event_end_date: dateStr,
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

        const startDateTime = `${eventData.event_start_date}T${eventData.event_start_time}:00`;
        const endDateTime = `${eventData.event_end_date}T${eventData.event_end_time}:00`;
        const newStart = new Date(startDateTime);
        const newEnd = new Date(endDateTime);

        if (newStart >= newEnd) {
            showToast("A kezdési időnek korábbinak kell lennie, mint a befejezésnek!", "error");
            return;
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
                    <div>
                        <h2>{existingEvent ? "Esemény szerkesztése" : "Esemény hozzáadása"}</h2>
                        <p className="popup-subtitle">Add meg az esemény részleteit, időpontját és dátumát.</p>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="popup-form">
                    <div className="form-group">
                        <input
                            type="text"
                            value={eventData.event_name}
                            onChange={(e) => setEventData({ ...eventData, event_name: e.target.value })}
                            placeholder="Esemény címe"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <input
                                type="date"
                                value={eventData.event_start_date}
                                onChange={(e) => setEventData({ ...eventData, event_start_date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="date"
                                value={eventData.event_end_date}
                                min={eventData.event_start_date}
                                onChange={(e) => setEventData({ ...eventData, event_end_date: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <input
                                type="time"
                                value={eventData.event_start_time}
                                onChange={(e) => setEventData({ ...eventData, event_start_time: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="time"
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
