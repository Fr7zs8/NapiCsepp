import { useState, useEffect } from "react";
import { X } from "lucide-react";
import "../EventPopup/EventPopup.css";
import "./AddTaskPopup.css";
import { activityService } from "../../router/apiRouter";
import { showToast } from "../Toast/showToast";

export function AddTaskPopup({ isOpen, onClose, onSuccess, selectedDate }) {
    const [taskName, setTaskName] = useState("");
    const [typeName, setTypeName] = useState("");
    const [difficultyName, setDifficultyName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [types, setTypes] = useState([]);
    const [difficulties, setDifficulties] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const dateStr = selectedDate
            ? new Date(selectedDate).toLocaleDateString("en-CA")
            : new Date().toLocaleDateString("en-CA");
        setStartDate(dateStr);
        setTaskName("");
        setTypeName("");
        setDifficultyName("");

        activityService.getAllTypes().then(data => {
            const filtered = data.filter(t => t.type_name !== "Szokás");
            setTypes(filtered);
            if (filtered.length > 0) setTypeName(filtered[0].type_name);
        });
        activityService.getAllDifficulties().then(data => {
            setDifficulties(data);
            if (data.length > 0) setDifficultyName(data[0].difficulty_name);
        });
    }, [isOpen, selectedDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!taskName.trim()) {
            showToast("Kérlek add meg a feladat nevét!", "error");
            return;
        }
        if (!typeName || !difficultyName) {
            showToast("Kérlek töltsd ki az összes mezőt!", "error");
            return;
        }
        setLoading(true);
        try {
            await activityService.createTask({
                activity_name: taskName.trim(),
                activity_type_name: typeName,
                activity_difficulty_name: difficultyName,
                activity_start_date: startDate,
                activity_end_date: startDate,
                activity_achive: 0,
            });
            showToast("Feladat sikeresen létrehozva!", "success");
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error(err);
            showToast("Hiba történt a feladat mentésekor!", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={e => e.stopPropagation()}>
                <div className="popup-header">
                    <h2>Új feladat</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="popup-form">
                    <div className="form-group">
                        <label htmlFor="task-name">Feladat neve *</label>
                        <input
                            type="text"
                            id="task-name"
                            value={taskName}
                            onChange={e => setTaskName(e.target.value)}
                            placeholder="pl. Olvasás, Futás..."
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="task-type">Típus *</label>
                            <select
                                id="task-type"
                                value={typeName}
                                onChange={e => setTypeName(e.target.value)}
                                required
                            >
                                {types.map(t => (
                                    <option key={t.type_id} value={t.type_name}>{t.type_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="task-difficulty">Nehézség *</label>
                            <select
                                id="task-difficulty"
                                value={difficultyName}
                                onChange={e => setDifficultyName(e.target.value)}
                                required
                            >
                                {difficulties.map(d => (
                                    <option key={d.difficulty_id} value={d.difficulty_name}>{d.difficulty_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="task-start">Dátum *</label>
                        <input
                            type="date"
                            id="task-start"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Mégse
                        </button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? "Mentés..." : "Létrehozás"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
