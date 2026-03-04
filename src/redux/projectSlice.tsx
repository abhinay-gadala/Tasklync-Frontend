import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Project {
    _id: string;
    name: string;
    tasks?: { status: string }[];
    members?: any[];
}

interface ProjectState {
    projects: Project[];
    selectedProjectId: string | null;
    loading: boolean;
    error: string | null;
    code: string;
}

const initialState: ProjectState = {
    projects: [],
    selectedProjectId: null,
    loading: false,
    error: null,
    code: "",
};

const projectSlice = createSlice({
    name: "project",
    initialState,
    reducers: {
        setProjects: (state, action: PayloadAction<Project[]>) => {
            state.projects = action.payload;
        },
        addProject: (state, action: PayloadAction<Project>) => {
            state.projects.push(action.payload);
        },
        updateProject: (state, action: PayloadAction<Project>) => {
            const index = state.projects.findIndex((p) => p._id === action.payload._id);
            if (index !== -1) {
                state.projects[index] = action.payload;
            }
        },
        deleteProject: (state, action: PayloadAction<string>) => {
            state.projects = state.projects.filter((p) => p._id !== action.payload);
            if (state.selectedProjectId === action.payload) {
                state.selectedProjectId = null;
            }
        },
        selectProject: (state, action: PayloadAction<string | null>) => {
            state.selectedProjectId = action.payload;
        },
        setProjectLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setProjectError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        userCode: (state, action: PayloadAction<string>) => {
            state.code = action.payload;
        }
    },
});

export const {
    setProjects,
    addProject,
    updateProject,
    deleteProject,
    selectProject,
    setProjectLoading,
    setProjectError,
    userCode,
} = projectSlice.actions;



export default projectSlice