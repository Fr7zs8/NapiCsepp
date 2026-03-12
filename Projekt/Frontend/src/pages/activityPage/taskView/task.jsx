import "./task.css";
import { Plus, Pencil, Trash2, Check, Loader2, Calendar, Info } from "lucide-react";
import { useEffect, useState } from "react";
import Task from "../../../classes/Views/task.jsx";
import Habit from "../../../classes/Views/habit.jsx";
import { activityService } from "../../../router/apiRouter.jsx";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../../components/Toast/showToast";
import { isAchieved, buildHabitMap, dispatchActivityEvents } from "../../../utils/activityUtils";

export function TaskView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [difficulties, setDifficulties] = useState([]);
  const [types, setTypes] = useState([]);
  const [flashSave, setFlashSave] = useState(false);
  const [sortBy, setSortBy] = useState("date");

  const [taskName, setTaskName] = useState("");
  const [typeName, setTypeName] = useState("");
  const [difficultyName, setDifficultyName] = useState("");
  const [editId, setEditId] = useState(null);

  async function refreshActivities() {
    try {
      setLoading(true);
      const [allActivities, habitsData] = await Promise.all([
        activityService.getAllActivities(),
        activityService.getAllHabits(),
      ]);

      const habitMap = buildHabitMap(allActivities, habitsData);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const taskObjects = allActivities
        .filter((item) => {
          if (item.activity_start_date) {
            const startDate = new Date(item.activity_start_date + "T00:00:00");
            const endDate = item.activity_end_date
              ? new Date(item.activity_end_date + "T23:59:59")
              : startDate;
            if (startDate > today || endDate < today) return false;
          }
          if (item.type_name === "Szokás") {
            const hm = habitMap[item.activity_name];
            if (hm && hm.targetDays > 0 && hm.daysElapsed >= hm.targetDays) return false;
          }
          return true;
        })
        .map(
          (item) => new Task(
            item.activity_id || Math.random(),
            item.activity_name,
            item.type_name,
            item.difficulty_name,
            isAchieved(item),
            item.activity_start_date,
            item.activity_end_date,
            true,
          )
        );

      setTasks(taskObjects);
    } catch (err) {
      setError(err.message || "Hiba az adatok betöltése során!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshActivities();
    window.addEventListener("activitiesUpdated", refreshActivities);
    return () => window.removeEventListener("activitiesUpdated", refreshActivities);
  }, []);

  useEffect(() => {
    async function fetchMeta() {
      try {
        const [diffsData, typesData] = await Promise.all([
          activityService.getAllDifficulties(),
          activityService.getAllTypes(),
        ]);
        setDifficulties(diffsData.map((d) => ({ difficulty_id: d.difficulty_id, difficulty_name: d.difficulty_name })));
        setTypes(typesData.map((t) => ({ type_id: t.type_id, type_name: t.type_name })));
      } catch (err) {
        setError(err.message || "Hiba az adatok betöltése során!");
        console.error(err);
      }
    }
    fetchMeta();
  }, []);

  async function addTask() {
    if (!taskName || !typeName || !difficultyName) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      await activityService.createTask({
        activity_name: taskName,
        activity_type_name: typeName,
        activity_difficulty_name: difficultyName,
        activity_start_date: today,
        activity_end_date: today,
        activity_achive: 0,
      });
      resetForm();
      await refreshActivities();
      showToast("Feladat sikeresen hozzáadva!", "success");
      dispatchActivityEvents();
    } catch (err) {
      showToast(err.message || "Hiba a feladat hozzáadása során!", "error");
      setError(err.message || "Hiba a feladat hozzáadása során!");
      console.error(err);
    }
  }

  function resetForm() {
    setTaskName("");
    setTypeName("");
    setDifficultyName("");
    setEditId(null);
  }

  async function deleteTask(id) {
    try {
      await activityService.deleteTask(id);
      await refreshActivities();
      showToast("Feladat sikeresen törölve!", "success");
      dispatchActivityEvents();
    } catch (err) {
      showToast(err.message || "Hiba a feladat törlése során!", "error");
      setError(err.message || "Hiba a feladat törlése során!");
      console.error(err);
    }
  }

  function startEditTask(task) {
    setEditId(task.taskId);
    setTaskName(task.taskName);
    setTypeName(task.typeName);
    setDifficultyName(task.difficultyName);
    setFlashSave(true);
    setTimeout(() => setFlashSave(false), 1200);
  }

  async function saveTask() {
    try {
      await activityService.updateTask(editId, {
        activity_name: taskName,
        activity_type_name: typeName,
        activity_difficulty_name: difficultyName,
      });
      resetForm();
      await refreshActivities();
      showToast("Feladat sikeresen módosítva!", "success");
      dispatchActivityEvents();
    } catch (err) {
      showToast(err.message || "Hiba a feladat szerkesztése során!", "error");
      setError(err.message || "Hiba a feladat szerkesztése során!");
      console.error(err);
    }
  }

  async function toggleTaskAchieved(taskId, currentValue) {
    try {
      const newVal = currentValue ? 0 : 1;
      await activityService.updateTask(taskId, { activity_achive: newVal });
      await refreshActivities();
      showToast(newVal ? "Feladat teljesítve!" : "Feladat visszavonva!", "success");
      dispatchActivityEvents();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Hiba a feladat státuszának frissítése során", "error");
      setError(err.message || "Hiba a feladat státuszának frissítése során");
    }
  }

  const difficultyColor = (name) => {
    const lower = (name || "").toLowerCase();
    if (lower.includes("könny")) return "#22c55e";
    if (lower.includes("neh")) return "#ef4444";
    return "#ffc107";
  };

  const difficultyOrder = { Nehéz: 1, Közepes: 2, Könnyű: 3 };

  function sortTasks(list, by) {
    return [...list].sort((a, b) =>
      by === "difficulty"
        ? (difficultyOrder[a.difficultyName] ?? 99) - (difficultyOrder[b.difficultyName] ?? 99)
        : (a.startDate || "").localeCompare(b.startDate || "")
    );
  }

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="animate-spin" /> Adatok szinkronizálása...
      </div>
    );
  }

  const isNoDataError = error && /nincs.*(task|feladat|nincsenek|nincs)/i.test(error);

  return (
    <section className="tasks-section">
      <div className="info-text-div">
        <p>Mai teendők</p>
        <p>Adj hozzá új feladatot a listához nehézség és típus szerint.</p>
      </div>
      <div className="task-disclaimer">
        <Info size={16} />
        <span>Csak az aktuális naphoz tartozó elemek láthatók. Ha szokáshoz tartozó elemeket szeretnél látni/ törölni, válts a szokások nézetre.</span>
      </div>
      <div className="back-row">
        <button className="back-btn" onClick={() => navigate("/")}>
          Vissza a főoldalra
        </button>
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
          {types
            .filter((type) => type.type_name !== "Szokás")
            .map((type) => (
              <option key={type.type_id} value={type.type_name}>{type.type_name}</option>
            ))}
        </select>

        <select
          className="priority-btn"
          value={difficultyName}
          onChange={(e) => setDifficultyName(e.target.value)}
        >
          <option value="" disabled hidden>Nehézség típusa</option>
          {difficulties.map((difficulty) => (
            <option key={difficulty.difficulty_id} value={difficulty.difficulty_name}>
              {difficulty.difficulty_name}
            </option>
          ))}
        </select>

        {editId === null ? (
          <button className="add-btn" onClick={addTask}>
            <Plus size={20} />
            Hozzáadás
          </button>
        ) : (
          <button className={`add-btn ${flashSave ? "flash" : ""}`} onClick={saveTask}>
            <Check size={20} />
            Mentés
          </button>
        )}
      </div>

      <div className="habit-list-header">
        <h3 className="habit-list-title">Mai feladatok</h3>
        <div className="sort-btns">
          <button
            className={`sort-btn ${sortBy === "date" ? "active" : ""}`}
            onClick={() => setSortBy("date")}
          >
            Dátum
          </button>
          <button
            className={`sort-btn ${sortBy === "difficulty" ? "active" : ""}`}
            onClick={() => setSortBy("difficulty")}
          >
            Nehézség
          </button>
        </div>
      </div>

      <div className="task-list-div">
        {tasks.length === 0 && (
          <p style={{ textAlign: "center", color: "#777", padding: "1rem" }}>
            Még nincsenek feladatok.
          </p>
        )}

        {sortTasks(tasks, sortBy).map((task) => (
          <div
            className={`task-item ${task.typeName === "Szokás" ? "habit-task" : ""} ${task.isCompleted ? "completed" : ""}`}
            key={task.taskId}
          >
            <div className="left-section">
              <input
                className="task-checkbox"
                type="checkbox"
                checked={!!task.isCompleted}
                onChange={() => toggleTaskAchieved(task.taskId, task.isCompleted)}
              />
              <div className="color-bar" style={{ background: difficultyColor(task.difficultyName) }}></div>
              <div className="task-texts">
                <p className={`task-name ${task.isCompleted ? "completed" : ""}`}>
                  {task.taskName}
                </p>
                <div className="labels">
                  <span className="label">{task.typeName}</span>
                  <span className="label">{task.difficultyName}</span>
                  <span className="label date-label">
                    <Calendar size={12} style={{ marginRight: "4px" }} />
                    {task.startDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="right-section">
              {task.typeName !== "Szokás" && (
                <button className="edit-btn" onClick={() => startEditTask(task)}>
                  <Pencil size={16} /> Szerkesztés
                </button>
              )}
              {task.typeName !== "Szokás" && (
                <button className="delete-btn" onClick={() => deleteTask(task.taskId)}>
                  <Trash2 size={16} /> Törlés
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isNoDataError && <div className="error-state">{error}</div>}
    </section>
  );
}
