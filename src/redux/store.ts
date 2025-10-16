import { configureStore } from "@reduxjs/toolkit";
import userSlice from './userSlice'

const store = configureStore({
    reducer: {
        userStore: userSlice.reducer
    }
})

export default store