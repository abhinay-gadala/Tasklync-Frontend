import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        name: "",
        email: "",
        password:"",
        error: "",
        showError: false,


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
        userError: (state, data) => {
            state.error = data.payload
        },
        userShowError: (state) => {
            state.showError = true
        },
    },
});



export default userSlice;
