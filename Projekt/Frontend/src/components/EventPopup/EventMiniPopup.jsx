import "./EventMiniPopup.css";

export function EventMiniPopup({ event, position, onEdit, onDelete, onClose }) {
    if (!event) return null;
    const handleEdit = () => {
        onEdit(event);
        onClose(); // Close the popup when editing
    };
    // Always extract the correct event_id for deletion
    const getEventId = (ev) => ev?.event_id || ev?.eventId;
    return (
        <div
            className="mini-popup"
            style={{ top: position.y, left: position.x }}
        >
            <button onClick={handleEdit}>Szerkesztés</button>
            <button onClick={() => onDelete(getEventId(event))}>Törlés</button>
            <button onClick={onClose}>Bezár</button>
        </div>
    );
}
