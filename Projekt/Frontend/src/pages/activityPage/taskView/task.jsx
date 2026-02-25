import "./task.css";
import { Plus, Pencil, Trash2, Check, Loader2, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import Task from "../../../classes/Views/task.jsx";
import Habit from "../../../classes/Views/habit.jsx";
import { activityService } from "../../../router/apiRouter.jsx";
import { useNavigate } from "react-router-dom";

export function TaskView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [difficulties, setDifficulties] = useState([]);
  const [types, setTypes] = useState([]);
  const [flashSave, setFlashSave] = useState(false);

  //
  const [taskName, setTaskName] = useState("");
  const [typeName, setTypeName] = useState("");
  const [difficultyName, setDifficultyName] = useState("");
  const [editId, setEditId] = useState(null);

  async function refreshActivities() {
    try {
      setLoading(true);
      const data = await activityService.getAllActivities();
      const habitsData = await activityService.getAllHabits();

      const habitMap = {};
      habitsData.forEach((h) => {
        const checkedCount = data.filter(
          (a) =>
            a.type_name === "Szokás" &&
            a.activity_name === h.activity_name &&
            (a.activity_achive === 1 ||
              a.activity_achive === true ||
              a.activity_achive === "1"),
        ).length;
        let targetDaysVal = null;
        if (h.target_days || h.target_days === 0) {
          targetDaysVal = Number(h.target_days);
        } else if (h.activity_start_date && h.activity_end_date) {
          try {
            const sd = new Date(h.activity_start_date);
            const ed = new Date(h.activity_end_date);
            sd.setHours(0, 0, 0, 0);
            ed.setHours(0, 0, 0, 0);
            const diff = Math.floor((ed - sd) / (1000 * 60 * 60 * 24));
            targetDaysVal = Math.max(0, diff + 1);
          } catch (e) {
            targetDaysVal = 0;
          }
        } else {
          targetDaysVal = 0;
        }

        const habitObj = new Habit(
          h.activity_id,
          h.activity_name,
          h.type_name,
          h.difficulty_name,
          targetDaysVal,
          h.activity_start_date,
          h.activity_end_date,
          checkedCount,
        );
        habitMap[h.activity_name] = habitObj;
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const taskObject = data
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
            if (hm && hm.isCompleted()) return false;
          }
          return true;
        })
        .map(
          (item) =>
            new Task(
              item.activity_id || Math.random(),
              item.activity_name,
              item.type_name,
              item.difficulty_name,
              item.activity_achive === 1,
              item.activity_start_date,
              item.activity_end_date,
              true,
            ),
        );

      setTasks(taskObject);
    } catch (err) {
      setError(err.message || "Hiba az adatok betöltése során!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshActivities();
    const handler = () => refreshActivities();
    window.addEventListener("activitiesUpdated", handler);
    return () => window.removeEventListener("activitiesUpdated", handler);
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
      await activityService.createTask({
        activity_name: taskName,
        activity_type_name: typeName,
        activity_difficulty_name: difficultyName,
        activity_start_date: new Date().toISOString().split("T")[0],
        activity_end_date: new Date().toISOString().split("T")[0],
        activity_achive: 0,
      });
      resetForm();
      await refreshActivities();
      window.dispatchEvent(new Event("activitiesUpdated"));
      window.dispatchEvent(new Event("itemSaved"));
    } catch (err) {
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
      window.dispatchEvent(new Event("activitiesUpdated"));
      window.dispatchEvent(new Event("itemSaved"));
    } catch (err) {
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
      window.dispatchEvent(new Event("activitiesUpdated"));
      window.dispatchEvent(new Event("itemSaved"));
    } catch (err) {
      setError(err.message || "Hiba a feladat szerkesztése során!");
      console.error(err);
    }
  }

  async function toggleTaskAchieved(taskId, currentValue) {
    try {
      const newVal = currentValue ? 0 : 1;
      // Csak az activity_achive mezőt frissítjük – a progress_counter-t a cron kezeli
      await activityService.updateTask(taskId, { activity_achive: newVal });
      await refreshActivities();
      window.dispatchEvent(new Event("activitiesUpdated"));
      window.dispatchEvent(new Event("itemSaved"));
    } catch (e) {
      console.error(e);
      setError(e.message || "Hiba a feladat státuszának frissítése során");
    }
  }

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="animate-spin" /> Adatok szinkronizálása...
      </div>
    );
  }

  return (
    <section className="tasks-section">
      <div className="info-text-div">
        <p>Mai teendők</p>
        <p>Csak az aktuális naphoz tartozó elemek láthatók.</p>
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
          <option value="" disabled hidden>
            Feladat típusa
          </option>
          {types
            .filter((type) => type.type_name !== "Szokás")
            .map((type) => (
              <option key={type.type_id} value={type.type_name}>
                {type.type_name}
              </option>
            ))}
        </select>

        <select
          className="priority-btn"
          value={difficultyName}
          onChange={(e) => setDifficultyName(e.target.value)}
        >
          <option value="" disabled hidden>
            Nehézség típusa
          </option>
          {difficulties.map((difficulty) => (
            <option
              key={difficulty.difficulty_id}
              value={difficulty.difficulty_name}
            >
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
          <button
            className={`add-btn ${flashSave ? "flash" : ""}`}
            onClick={saveTask}
          >
            <Check size={20} />
            Mentés
          </button>
        )}
      </div>

      <div className="task-list-div">
        {tasks.length === 0 && (
          <p style={{ textAlign: "center", color: "#777", padding: "1rem" }}>
            Még nincsenek feladatok.
          </p>
        )}

        {tasks.map((task) => (
          <div
            className={`task-item ${task.typeName === "Szokás" ? "habit-task" : ""} ${task.isCompleted ? "completed" : ""}`}
            key={task.taskId}
          >
            <div className="left-section">
              <input
                className="task-checkbox"
                type="checkbox"
                checked={!!task.isCompleted}
                onChange={() =>
                  toggleTaskAchieved(task.taskId, task.isCompleted)
                }
              />

              <div className="color-bar"></div>

              <div className="task-texts">
                <p
                  className={`task-name ${task.isCompleted ? "completed" : ""}`}
                >
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
                <button
                  className="edit-btn"
                  onClick={() => startEditTask(task)}
                >
                  <Pencil size={16} /> Szerkesztés
                </button>
              )}

              {task.typeName !== "Szokás" && (
                <button
                  className="delete-btn"
                  onClick={() => deleteTask(task.taskId)}
                >
                  <Trash2 size={16} /> Törlés
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div>
        {(() => {
          const isNoDataError =
            error && /nincs.*(task|feladat|nincsenek|nincs)/i.test(error);
          return isNoDataError ? (
            ""
          ) : (
            <div className="error-state">{error}</div>
          );
        })()}
      </div>
    </section>
  );
}
