import { createSlice } from "@reduxjs/toolkit";

const loopSlice = createSlice({
    name: "loop",
    initialState: {
        loopData: [],
    },
    reducers: {
        setLoopData: (state, action) => {
            state.loopData = action.payload
            console.log("Inside reducer - Loop data:", action.payload);
        },
    }
})

export const { setLoopData } = loopSlice.actions
export default loopSlice.reducer