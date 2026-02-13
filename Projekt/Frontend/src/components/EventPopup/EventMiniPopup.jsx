import "./EventMiniPopup.css";

export function EventMiniPopup({ event, position, onEdit, onDelete, onClose }) {
    if (!event) return null;

    return (
        <div
            className="mini-popup"
            style={{ top: position.y, left: position.x }}
        >
            <button onClick={() => onEdit(event)}>Szerkesztés</button>
            <button onClick={() => onDelete(event.event_id)}>Törlés</button>
            <button onClick={onClose}>Bezár</button>
        </div>
    );
}
