import { createSlice } from "@reduxjs/toolkit";


const userSlice = createSlice({
    name: "user",
    initialState: {
        name: "",
        email: "",
        password: "",
        role: "",
        error: "",
        showError: false,
        showTask: false


    },
    reducers: {
        userName: (state, data) => {
            state.name = data.payload;
        },
        userEmail: (state, data) => {
            state.email = data.payload
        },
        userPassword: (state, data) => {
            state.password = data.payload
        },
        userRole: (state, data) => {
            state.role = data.payload;
        },
        userError: (state, data) => {
            state.error = data.payload
        },
        userShowError: (state) => {
            state.showError = true
        },
        userShowTask: (state) => {
            if (state.showTask) {
                state.showTask = false
            } else {
                state.showTask = true
            }
        }
    },
});



export default userSlice;
