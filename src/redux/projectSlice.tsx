import { createSlice } from "@reduxjs/toolkit";

const projectSlice = createSlice({
    name: "Project",
    initialState: {
        names: "",
        companyName: "",
        companyEmail: "",
        companyAddress: "",
        code: ""
     },
    reducers: {
        userNames: (state, data) => {
            state.names = data.payload
        },
        userCompany: (state, data) => {
            state.companyName = data.payload
        },
         userEmail: (state, data) => {
            state.companyEmail = data.payload
        },
         userAddress: (state, data) => {
            state.companyAddress = data.payload
        },
         userCode: (state, data) => {
            state.code = data.payload
        }

    }
})


export default projectSlice