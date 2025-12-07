export default class Task{
    constructor(taskId, taskName,typeName,difficultyName, isCompleted, startDate,  endDate,  isActive, ){
        this.taskId = taskId,
        this.taskName = taskName,
        this.typeName = typeName,
        this.difficultyName = difficultyName,
        this.startDate = startDate,
        this.endDate = endDate,
        this.isCompleted = isCompleted,
        this.isActive = isActive;
    }

    markCompleted(){
        this.isCompleted = true;
    }

    toggleActivity(){
        this.isActive = !this.isActive;
    }

    getDifficulty(){
        return this.difficultyName;
    }

    toJSON() {
        return {
            taskId: this.taskId,
            taskName: this.taskName,
            typeName: this.typeName,
            difficultyName: this.difficultyName,
            startDate: this.startDate,
            endDate: this.endDate,
            isCompleted: this.isCompleted,
            isActive: this.isActive
        };
    }
}