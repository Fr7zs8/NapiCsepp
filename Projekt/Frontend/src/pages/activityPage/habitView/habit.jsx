import "./habit.css";
import { Plus, Pencil, Trash2, Calendar, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Habit from "../../../classes/Views/habit.jsx";
import { activityService } from "../../../router/apiRouter.jsx";

export function HabitView() {
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [habitName, setHabitName] = useState("");
  const [difficultyName, setDifficultyName] = useState("");
  const [targetDays, setTargetDays] = useState("");
  const [startDate, setStartDate] = useState("");
  const [editId, setEditId] = useState(null);
  const [difficulties, setDifficulties] = useState([]);
  const [flashSave, setFlashSave] = useState(false);

  useEffect(() => {
    async function fetchDifficulties() {
      try {
        const data = await activityService.getAllDifficulties();
        setDifficulties(data);
      } catch (err) {
        setError(err.message || "Hiba az adatok betöltése során!");
        console.error(err);
      }
    }
    fetchDifficulties();
  }, []);

  function resetForm() {
    setHabitName("");
    setDifficultyName("");
    setTargetDays("");
    setStartDate("");
    setEditId(null);
  }

  async function addHabit() {
    if (!habitName || !difficultyName || !targetDays || !startDate) return;

    try {
      const habitData = {
        activity_name: habitName,
        activity_type_name: "Szokás",
        activity_difficulty_name: difficultyName,
        activity_start_date: startDate,
        activity_end_date: new Date(
          new Date(startDate).getTime() +
            (Math.max(1, parseInt(targetDays, 10)) - 1) * 24 * 60 * 60 * 1000,
        )
          .toISOString()
          .split("T")[0],
        activity_achive: 0,
      };
      await activityService.createHabit(habitData);
      const data = await activityService.getAllHabits();
      const habitObj = data.map((item) => {
        let targetDaysVal = null;
        if (item.target_days || item.target_days === 0) {
          targetDaysVal = Number(item.target_days);
        } else if (item.activity_start_date && item.activity_end_date) {
          try {
            const sd = new Date(item.activity_start_date);
            const ed = new Date(item.activity_end_date);
            sd.setHours(0,0,0,0);
            ed.setHours(0,0,0,0);
            const diff = Math.floor((ed - sd) / (1000*60*60*24));
            targetDaysVal = Math.max(0, diff + 1);
          } catch(e) {
            targetDaysVal = 0;
          }
        } else {
          targetDaysVal = 0;
        }

        return new Habit(
          item.activity_id,
          item.activity_name,
          item.type_name,
          item.difficulty_name,
          targetDaysVal,
          item.activity_start_date,
          item.activity_end_date,
          null, // checkedDays - nem használjuk többé
          item.progress_counter, // progressCounter a backendből
        );
      });
      setHabits(habitObj);
      resetForm();
      try { 
        window.dispatchEvent(new Event('activitiesUpdated'));
        window.dispatchEvent(new Event('itemSaved'));
      } catch(e){}
    } catch (err) {
      setError(err.message || "Hiba a szokás hozzáadása során!");
      console.error(err);
    }
  }

  function editHabit(id) {
    const h = habits.find((h) => h.habitId === id);
    if (!h) return;

    setHabitName(h.habitName);
    setDifficultyName(h.difficultyName);
    const td = h.targetDays ?? h.totalDays ?? "";
    setTargetDays(td === "" ? "" : String(td));
    setStartDate(h.startDate);
    setEditId(id);
    setFlashSave(true);
    setTimeout(() => setFlashSave(false), 1200);
  }

  async function saveHabit() {
    try {
      const updateData = {
        activity_name: habitName,
        activity_type_name: "Szokás",
        activity_difficulty_name: difficultyName,
        activity_start_date: startDate,
        activity_end_date: new Date(
          new Date(startDate).getTime() +
            (Math.max(1, parseInt(targetDays, 10)) - 1) * 24 * 60 * 60 * 1000,
        )
          .toISOString()
          .split("T")[0],
      };
      await activityService.updateHabit(editId, updateData);
      const data = await activityService.getAllHabits();
      const habitObj = data.map((item) => {
        let targetDaysVal = null;
        if (item.target_days || item.target_days === 0) {
          targetDaysVal = Number(item.target_days);
        } else if (item.activity_start_date && item.activity_end_date) {
          try {
            const sd = new Date(item.activity_start_date);
            const ed = new Date(item.activity_end_date);
            sd.setHours(0,0,0,0);
            ed.setHours(0,0,0,0);
            const diff = Math.floor((ed - sd) / (1000*60*60*24));
            targetDaysVal = Math.max(0, diff + 1);
          } catch (e) {
            targetDaysVal = 0;
          }
        } else {
          targetDaysVal = 0;
        }

        return new Habit(
          item.activity_id,
          item.activity_name,
          item.type_name,
          item.difficulty_name,
          targetDaysVal,
          item.activity_start_date,
          item.activity_end_date,
          null,
          item.progress_counter,
        );
      });
      setHabits(habitObj);
      resetForm();
      try { 
        window.dispatchEvent(new Event('activitiesUpdated'));
        window.dispatchEvent(new Event('itemSaved'));
      } catch(e){}
    } catch (err) {
      setError(err.message || "Hiba a szokás szerkesztése során!");
      console.error(err);
    }
  }

  async function deleteHabit(id) {
    try {
      await activityService.deleteHabit(id);
      const data = await activityService.getAllHabits();
      const habitObj = data.map((item) => {
        let targetDaysVal = null;
        if (item.target_days || item.target_days === 0) {
          targetDaysVal = Number(item.target_days);
        } else if (item.activity_start_date && item.activity_end_date) {
          try {
            const sd = new Date(item.activity_start_date);
            const ed = new Date(item.activity_end_date);
            sd.setHours(0,0,0,0);
            ed.setHours(0,0,0,0);
            const diff = Math.floor((ed - sd) / (1000*60*60*24));
            targetDaysVal = Math.max(0, diff + 1);
          } catch (e) {
            targetDaysVal = 0;
          }
        } else {
          targetDaysVal = 0;
        }

        return new Habit(
          item.activity_id,
          item.activity_name,
          item.type_name,
          item.difficulty_name,
          targetDaysVal,
          item.activity_start_date,
          item.activity_end_date,
          null,
          item.progress_counter,
        );
      });
      setHabits(habitObj);
      try { 
        window.dispatchEvent(new Event('activitiesUpdated'));
        window.dispatchEvent(new Event('itemSaved'));
      } catch(e){}
    } catch (err) {
      setError(err.message || "Hiba a szokás törlése során!");
      console.error(err);
    }
  }

  useEffect(() => {
    async function fetchHabits() {
      try {
        setLoading(true);
        const data = await activityService.getAllHabits();

        const habitObj = data.map((item) => {
          let targetDaysVal = null;
          if (item.target_days || item.target_days === 0) {
            targetDaysVal = Number(item.target_days);
          } else if (item.activity_start_date && item.activity_end_date) {
            try {
              const sd = new Date(item.activity_start_date);
              const ed = new Date(item.activity_end_date);
              sd.setHours(0,0,0,0);
              ed.setHours(0,0,0,0);
              const diff = Math.floor((ed - sd) / (1000*60*60*24));
              targetDaysVal = Math.max(0, diff + 1);
            } catch (e) {
              targetDaysVal = 0;
            }
          } else {
            targetDaysVal = 0;
          }

          return new Habit(
            item.activity_id,
            item.activity_name,
            item.type_name,
            item.difficulty_name,
            targetDaysVal,
            item.activity_start_date,
            item.activity_end_date,
            null, // checkedDays - nem használjuk többé
            item.progress_counter, // progressCounter a backendből
          );
        });
        setHabits(habitObj);
      } catch (err) {
        setError(err.message || "Hiba az adatok betöltése során!");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchHabits();
    const handler = () => fetchHabits();
    window.addEventListener('activitiesUpdated', handler);
    return () => window.removeEventListener('activitiesUpdated', handler);
  }, []);

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
        <p>Szokások (Habits)</p>
        <p>Adj hozzá szokást megadott időtartammal és kezdési dátummal.</p>
      </div>
      <div className="back-row">
        <button className="back-btn" onClick={() => navigate("/")}>Vissza a főoldalra</button>
      </div>

      <div className="task-form-div">
        <input
          type="text"
          placeholder="Szokás neve"
          className="task-name-input"
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
        />

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

        <select
          className="priority-btn"
          value={targetDays}
          onChange={(e) => setTargetDays(e.target.value)}
        >
          <option value="" disabled hidden>
            Időtartam
          </option>
          <option value="7">1 hét</option>
          <option value="30">1 hónap</option>
          <option value="365">1 év</option>
          {targetDays && !["7","30","365"].includes(String(targetDays)) && (
            <option value={String(targetDays)}>{String(targetDays)} nap</option>
          )}
        </select>

        <input  //<-ezt akarom kiszedni mert nincs nagyon nagy értelme, a naptár megjelenítési helyénél kívül..
          type="date"
          className="priority-btn"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Kezdés dátuma"
        />  

        <button className={`add-btn ${flashSave ? 'flash' : ''}`} onClick={editId ? saveHabit : addHabit}>
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

        {habits.map((habit) => (
          <div className={`task-item ${habit.isCompleted() ? 'completed' : ''}`} key={habit.habitId}>
            <div className="left-section">
              <div className="color-bar"></div>

              <div className="task-texts">
                <p className={`task-name ${habit.isCompleted() ? 'completed' : ''}`}>{habit.habitName}</p>

                <div className="labels">
                  <span className="label">{habit.typeName}</span>
                  <span className="label">{habit.difficultyName}</span>
                  <span className="label date-label">
                    <Calendar size={12} style={{ marginRight: "4px" }} />
                    {habit.startDate}
                  </span>
                </div>

                <div className="progress-container">
                  <div className="progress-info">
                          <span className="progress-text">
                            {habit.getCheckedDays()} / {habit.totalDays || habit.targetDays} nap
                          </span>
                    <span className="progress-percent">
                      {habit.getProgress()}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${habit.isCompleted() ? "completed" : ""}`}
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
              <button
                className="edit-btn"
                onClick={() => editHabit(habit.habitId)}
              >
                <Pencil size={16} /> Szerkesztés
              </button>
              <button
                className="delete-btn"
                onClick={() => deleteHabit(habit.habitId)}
              >
                <Trash2 size={16} /> Törlés
              </button>
            </div>
          </div>
        ))}
      </div>
      <div>
        {(() => {
          const isNoDataError =
            error && /nincs.*(habit|szoká|szokas|feladat|task)/i.test(error);
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
