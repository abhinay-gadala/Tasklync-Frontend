import { configureStore } from "@reduxjs/toolkit";
import userSlice from './userSlice'
import projectSlice from './projectSlice'
import viewSlice from './viewSlice'

const store = configureStore({
    reducer: {
        userStore: userSlice.reducer,
        projectStore: projectSlice.reducer,
        viewStore: viewSlice.reducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store