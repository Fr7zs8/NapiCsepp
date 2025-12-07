import "./task.css";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import { useState } from "react";
import Task from "../../../classes/Views/task.jsx";

export function TaskView(){

    const [tasks, setTasks] = useState([]);
    const [taskName, setTaskName] = useState("");
    const [typeName, setTypeName] = useState("");
    const [difficultyName, setDifficultyName] = useState("");

    const [editId, setEditId] = useState(null);

    function addTask() {
        if (!taskName || !typeName || !difficultyName) return;

        const newTask = new Task(
            Date.now(),
            taskName,
            typeName,
            difficultyName,
            0,
            new Date().toISOString().split("T")[0],
            new Date().toISOString().split("T")[0]
        );

        setTasks(prev => [...prev, newTask]);

        resetForm();
    }

    function resetForm() {
        setTaskName("");
        setTypeName("");
        setDifficultyName("");
        setEditId(null);
    }

    function deleteTask(id) {
        setTasks(prev => prev.filter(t => t.taskId !== id));
    }

    function startEditTask(task) {
        setEditId(task.taskId);
        setTaskName(task.taskName);
        setTypeName(task.typeName);
        setDifficultyName(task.difficultyName);
    }

    function saveTask() {
        setTasks(prev => {
            console.log(prev)
            return prev.map(t => t.taskId === editId ? { ...t, taskName, typeName, difficultyName }: t)
        });
        resetForm();
    }


    return (
        <section className="tasks-section">

            <div className="info-text-div">
                <p>Mai teendők</p>
                <p>Csak az aktuális naphoz tartozó elemek láthatók.</p>
            </div>

            <div className="task-form-div">
                <input 
                    type="text"
                    placeholder="Feladat neve"
                    className="task-name-input"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                />

                <select 
                    className="priority-btn"
                    value={typeName}
                    onChange={(e) => setTypeName(e.target.value)}
                >
                    <option value="" disabled hidden>Feladat típusa</option>
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
                    <option value="" disabled hidden>Nehézség típusa</option>
                    <option value="Nehéz">Nehéz</option>
                    <option value="Közepes">Közepes</option>
                    <option value="Könnyű">Könnyű</option>
                </select>

                {editId === null ? (
                    <button className="add-btn" onClick={addTask}>
                        <Plus size={20} />
                        Hozzáadás
                    </button>
                ) : (
                    <button className="add-btn" onClick={saveTask}>
                        <Check size={20} />
                        Mentés
                    </button>
                )}
            </div>

            <div className="task-list-div">
                {tasks.map(task => (
                    <div className="task-item" key={task.taskId}>
                        <div className="left-section">
                            <input type="checkbox" />

                            <div className="color-bar"></div>

                            <div className="task-texts">
                                <p className="task-name">{task.taskName}</p>

                                <div className="labels">
                                    <span className="label">{task.typeName}</span>
                                    <span className="label">{task.difficultyName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="right-section">
                            <button 
                                className="edit-btn"
                                onClick={() => startEditTask(task)}
                            >
                                <Pencil size={16}/> Szerkesztés
                            </button>

                            <button 
                                className="delete-btn"
                                onClick={() => deleteTask(task.taskId)}
                            >
                                <Trash2 size={16}/> Törlés
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </section>
    );
}
