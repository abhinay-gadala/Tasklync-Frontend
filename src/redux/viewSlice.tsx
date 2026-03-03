import { createSlice } from "@reduxjs/toolkit";

export type ViewType =
  | "home"
  | "tasks"
  | "inbox"
  | "reporting"
  | "portfolios"
  | "goals"
  | "workspace"
  | "project";

interface ViewState {
  activeView: ViewType;
  activeProjectId?: string;
}

const initialState: ViewState = {
  activeView: "home",
  activeProjectId: undefined,
};

const viewSlice = createSlice({
  name: "view",
  initialState,
  reducers: {
    // ✅ THIS FIXES YOUR ERROR
    setActiveView(state, data) {
      state.activeView = data.payload;
      if (data.payload !== "workspace") {
        state.activeProjectId = undefined;
      }
    },

    // ✅ Used when clicking a project in sidebar
    openProject(state, data) {
      state.activeView = "project";
      state.activeProjectId = data.payload;
    },
  },
});

export const { setActiveView, openProject } = viewSlice.actions;
export default viewSlice;


