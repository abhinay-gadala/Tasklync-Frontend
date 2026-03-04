import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Task {
    _id: string;
    title: string;
    description?: string;
    status: string;
    projectId?: string;
    project?: any; // populated project object
    dueDate?: string | null;
    assignedTo?: any; // populated user object or string id
    assignedEmail?: string;
    priority?: string;
}

interface TaskState {
    tasks: Task[];
    loading: boolean;
    error: string | null;
}

const initialState: TaskState = {
    tasks: [],
    loading: false,
    error: null,
};

const taskSlice = createSlice({
    name: "task",
    initialState,
    reducers: {
        setTasks: (state, action: PayloadAction<Task[]>) => {
            state.tasks = action.payload;
        },
        addTask: (state, action: PayloadAction<Task>) => {
            state.tasks.push(action.payload);
        },
        updateTask: (state, action: PayloadAction<Task>) => {
            const index = state.tasks.findIndex((t) => t._id === action.payload._id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
        },
        deleteTask: (state, action: PayloadAction<string>) => {
            state.tasks = state.tasks.filter((t) => t._id !== action.payload);
        },
        moveTaskStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
            const task = state.tasks.find((t) => t._id === action.payload.id);
            if (task) {
                task.status = action.payload.status;
            }
        },
        setTaskLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setTaskError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    moveTaskStatus,
    setTaskLoading,
    setTaskError,
} = taskSlice.actions;

export default taskSlice;
