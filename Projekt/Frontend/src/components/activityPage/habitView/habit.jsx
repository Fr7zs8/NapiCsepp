import "./habit.css";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { useState } from "react";
import Habit from "../../../classes/Views/habit.jsx";

export function HabitView() {
    const [habits, setHabits] = useState([]);
    const [habitName, setHabitName] = useState("");
    const [typeName, setTypeName] = useState("");
    const [difficultyName, setDifficultyName] = useState("");
    const [targetDays, setTargetDays] = useState("");
    const [startDate, setStartDate] = useState("");
    const [editId, setEditId] = useState(null);

    function resetForm() {
        setHabitName("");
        setTypeName("");
        setDifficultyName("");
        setTargetDays("");
        setStartDate("");
        setEditId(null);
    }

    function addHabit() {
        if (!habitName || !typeName || !difficultyName || !targetDays || !startDate) return;

        const newHabit = new Habit(
            Date.now(),
            habitName,
            typeName,
            difficultyName,
            parseInt(targetDays),
            startDate
        );

        setHabits(prev => [...prev, newHabit]);
        resetForm();
    }

    function editHabit(id) {
        const h = habits.find(h => h.habitId === id);
        if (!h) return;

        setHabitName(h.habitName);
        setTypeName(h.typeName);
        setDifficultyName(h.difficultyName);
        setTargetDays(h.targetDays);
        setStartDate(h.startDate);
        setEditId(id);
    }

    function saveHabit() {
        setHabits(prev => {
            console.log(prev)
            return prev.map(h =>
                h.habitId === editId ? new Habit(h.habitId, habitName, typeName, difficultyName, parseInt(targetDays), startDate): h
            )
        });
        resetForm();
    }

    function deleteHabit(id) {
        setHabits(prev => prev.filter(h => h.habitId !== id));
    }

    return (
        <section className="tasks-section">
            <div className="info-text-div">
                <p>Szokások (Habits)</p>
                <p>Adj hozzá szokást megadott időtartammal és kezdési dátummal.</p>
            </div>

            <div className="task-form-div">
                <input 
                    type="text" 
                    placeholder="Szokás neve"
                    className="task-name-input"
                    value={habitName}
                    onChange={e => setHabitName(e.target.value)}
                />

                <select
                    className="priority-btn"
                    value={typeName}
                    onChange={(e) => setTypeName(e.target.value)}
                >
                    <option value="" disabled hidden>Szokás típusa</option>
                    <option value="Tanulás">Tanulás</option>
                    <option value="Mozgás">Mozgás</option>
                    <option value="Munka">Munka</option>
                    <option value="Egyéb">Egyéb</option>
                </select>

                <select
                    className="priority-btn"
                    value={difficultyName}
                    onChange={(e) => setDifficultyName(e.target.value)}
                >
                    <option value="" disabled hidden>Nehézség</option>
                    <option value="Könnyű">Könnyű</option>
                    <option value="Közepes">Közepes</option>
                    <option value="Nehéz">Nehéz</option>
                </select>

                <select
                    className="priority-btn"
                    value={targetDays}
                    onChange={(e) => setTargetDays(e.target.value)}
                >
                    <option value="" disabled hidden>Időtartam</option>
                    <option value="7">1 hét</option>
                    <option value="30">1 hónap</option>
                    <option value="365">1 év</option>
                </select>

                <input
                    type="date"
                    className="priority-btn"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Kezdés dátuma"
                />

                <button className="add-btn" onClick={editId ? saveHabit : addHabit}>
                    <Plus size={20} />
                    {editId ? "Mentés" : "Hozzáadás"}
                </button>
            </div>

            <div className="task-list-div">
                {habits.length === 0 && (
                    <p style={{ textAlign: "center", color: "#777", padding: "1rem" }}>
                        Még nincsenek szokások.
                    </p>
                )}

                {habits.map(habit => (
                    <div className="task-item" key={habit.habitId}>
                        <div className="left-section">
                            <div className="color-bar"></div>

                            <div className="task-texts">
                                <p className="task-name">{habit.habitName}</p>

                                <div className="labels">
                                    <span className="label">{habit.typeName}</span>
                                    <span className="label">{habit.difficultyName}</span>
                                    <span className="label">
                                        <Calendar size={12} style={{ marginRight: "4px" }} />
                                        {habit.startDate}
                                    </span>
                                </div>

                                <div className="progress-container">
                                    <div className="progress-info">
                                        <span className="progress-text">
                                            {habit.getDaysElapsed()} / {habit.targetDays} nap
                                        </span>
                                        <span className="progress-percent">
                                            {habit.getProgress()}%
                                        </span>
                                    </div>
                                    <div className="progress-bar">
                                        <div 
                                            className={`progress-fill ${habit.isCompleted() ? 'completed' : ''}`}
                                            style={{ width: `${habit.getProgress()}%` }}
                                        ></div>
                                    </div>
                                    {habit.isCompleted() && (
                                        <span className="completed-badge">✓ Teljesítve!</span>
                                    )}
                                    {!habit.isCompleted() && habit.getDaysRemaining() > 0 && (
                                        <span className="remaining-days">
                                            {habit.getDaysRemaining()} nap van hátra
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="right-section">
                            <button className="edit-btn" onClick={() => editHabit(habit.habitId)}>
                                <Pencil size={16}/> Szerkesztés
                            </button>
                            <button className="delete-btn" onClick={() => deleteHabit(habit.habitId)}>
                                <Trash2 size={16}/> Törlés
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}