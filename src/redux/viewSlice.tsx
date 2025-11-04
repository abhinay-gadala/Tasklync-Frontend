import { createSlice } from "@reduxjs/toolkit";

interface ViewState {
  activeView: string;
}

const initialState: ViewState = {
  activeView: "home",
};

const viewSlice = createSlice({
  name: "view",
  initialState,
  reducers: {
    setActiveView: (state, action) => {
      state.activeView = action.payload;
    },
  },
});

export const { setActiveView } = viewSlice.actions;
export default viewSlice

