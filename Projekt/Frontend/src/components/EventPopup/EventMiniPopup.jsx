import { useEffect, useRef } from "react";
import "./EventMiniPopup.css";

export function EventMiniPopup({ event, position, onEdit, onDelete, onClose }) {
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    if (!event) return null;
    const handleEdit = () => {
        onEdit(event);
        onClose();
    };
    const getEventId = (ev) => ev?.event_id || ev?.eventId;
    return (
        <div
            ref={ref}
            className="mini-popup"
            style={{ top: position.y, left: position.x }}
        >
            <button onClick={handleEdit}>Szerkesztés</button>
            <button onClick={() => onDelete(getEventId(event))}>Törlés</button>
            <button onClick={onClose}>Bezár</button>
        </div>
    );
}
