import "./task.css";
import { Plus, Pencil, Trash2, Check, Loader2, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import Task from "../../../classes/Views/task.jsx";
import { activityService } from "../../../router/apiRouter.jsx"

export function TaskView(){

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [difficulties, setDifficulties] = useState([]);
    const [types, setTypes] = useState([]);

    //
    const [taskName, setTaskName] = useState("");
    const [typeName, setTypeName] = useState("");
    const [difficultyName, setDifficultyName] = useState("");
    const [editId, setEditId] = useState(null);


    useEffect(()=>{
        const fetchActivities = async ()=> {
            try {
                setLoading(true);
                const data = await activityService.getAllActivities();

                const taskObject = data
                    .filter( item => 
                        item.activity_type_id
                    )
                    .map(item => new Task(
                        item.activity_id || Math.random(),
                        item.activity_name,
                        item.type_name,
                        item.difficulty_name,
                        item.activity_achive === 1,
                        item.activity_start_date,
                        item.activity_end_date,
                        true
                    ));

                setTasks(taskObject);
            }
            catch (err){
                setError(err.message || "Hiba az adatok betöltése során!");
                console.error(err);
            }
            finally{
                setLoading(false);
            }
        }
        fetchActivities();
    }, []);

    useEffect(()=>{
        async function fetchDifficulties(){
            try{
                setLoading(true);
                const data = await activityService.getAllDifficulties();
                
                const diffObj = data.map(item => ({
                    difficulty_id: item.difficulty_id,
                    difficulty_name: item.difficulty_name
                }));

                setDifficulties(diffObj);
            }
            catch(err){
                setError(err.message || "Hiba az adatok betöltése során!");
                console.error(err);
            }
            finally{
                setLoading(false);
            }
        }

        fetchDifficulties();
    },[]);

    useEffect(()=>{
        async function fetchTypes(){
            try{
                setLoading(true);
                const data = await activityService.getAllTypes();
                
                const diffObj = data.map(item => ({
                    type_id: item.type_id,
                    type_name: item.type_name
                }));
                
                setTypes(diffObj);
            }
            catch(err){
                setError(err.message || "Hiba az adatok betöltése során!");
                console.error(err);
            }
            finally{
                setLoading(false);
            }
        }

        fetchTypes();
    },[]);

    async function addTask() {
        if (!taskName || !typeName || !difficultyName) return;

        try {
            const taskData = {
                activity_name: taskName,
                activity_type_name: typeName,
                activity_difficulty_name: difficultyName,
                activity_start_date: new Date().toISOString().split("T")[0],
                activity_end_date: new Date().toISOString().split("T")[0],
                activity_achive: 0
            };
            await activityService.createTask(taskData);
            
            const data = await activityService.getAllActivities();
            const taskObject = data
            .filter( item => 
                        item.activity_type_id !== 4
                    )
            .map(item => new Task(
                item.activity_id || Math.random(),
                item.activity_name,
                item.type_name,
                item.difficulty_name,
                item.activity_achive === 1,
                item.activity_start_date,
                item.activity_end_date,
                true
            ));
            setTasks(taskObject);
            resetForm();
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
            
            const data = await activityService.getAllActivities();
            const taskObject = data
                .filter(item => item.activity_type_id !== 4 )
                .map(item => new Task(
                    item.activity_id || Math.random(),
                    item.activity_name,
                    item.type_name,
                    item.difficulty_name,
                    item.activity_achive === 1,
                    item.activity_start_date,
                    item.activity_end_date,
                    true
                ));
            setTasks(taskObject);
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
    }

    async function saveTask() {
        try {
            const updateData = {
                activity_name: taskName,
                activity_type_name: typeName,
                activity_difficulty_name: difficultyName
            };
            //await activityService.updateTask(editId, updateData); <-- ez még nem működik, mert a backend nem fogadja el a type és difficulty nevet, csak id-t
            
            const data = await activityService.getAllActivities();
            const taskObject = data
                .filter(item => item.activity_type_id !== 4)
                .map(item => new Task(
                    item.activity_id || Math.random(),
                    item.activity_name,
                    item.type_name,
                    item.difficulty_name,
                    item.activity_achive === 1,
                    item.activity_start_date,
                    item.activity_end_date,
                    true
                ));
            setTasks(taskObject);
            resetForm();
        } catch (err) {
            setError(err.message || "Hiba a feladat szerkesztése során!");
            console.error(err);
        }
    }

    if (loading) {
        return <div className="loading-state"><Loader2 className="animate-spin" /> Adatok szinkronizálása...</div>;
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
                    {types.filter(type => type.type_name !== "Szokás").map(type => (
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
                    <option value="" disabled hidden>Nehézség típusa</option>
                    {difficulties.map(difficulty => (
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
                    <button className="add-btn" onClick={saveTask}>
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
                                    <span className="label date-label">
                                        <Calendar size={12} style={{ marginRight: "4px" }} />
                                        {task.startDate}
                                    </span>
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
            <div>
                {(() => {
                    const isNoDataError = error && /nincs.*(task|feladat|nincsenek|nincs)/i.test(error);
                    return isNoDataError ? "" : <div className="error-state">{error}</div>;
                })()}
            </div>
        </section>
    );
}
