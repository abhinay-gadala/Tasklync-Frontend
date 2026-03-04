import { configureStore } from "@reduxjs/toolkit";
import userSlice from './userSlice'
import projectSlice from './projectSlice'
import viewSlice from './viewSlice'
import taskSlice from './taskSlice'
import searchSlice from './searchSlice'

const store = configureStore({
    reducer: {
        userStore: userSlice.reducer,
        projectStore: projectSlice.reducer,
        viewStore: viewSlice.reducer,
        taskStore: taskSlice.reducer,
        searchStore: searchSlice.reducer,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store