import { configureStore } from "@reduxjs/toolkit";
import userSlice from './userSlice'
import projectSlice from './projectSlice'

const store = configureStore({
    reducer: {
        userStore: userSlice.reducer,
        projectStore: projectSlice.reducer
    }
})

export default store