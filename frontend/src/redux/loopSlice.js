import { createSlice } from "@reduxjs/toolkit";

const loopSlice = createSlice({
    name: "loop",
    initialState: {
        loopData: [],
        totalPages: 1,
        currentPage: 1,
        hasMore: true,
        totalLoops: 0,
    },
    reducers: {
        setLoopData: (state, action) => {
            // Set initial data (first page)
            state.loopData = action.payload.loops || action.payload;
            state.totalPages = action.payload.totalPages || 1;
            state.currentPage = action.payload.currentPage || 1;
            state.hasMore = action.payload.hasMore !== undefined ? action.payload.hasMore : true;
            state.totalLoops = action.payload.totalLoops || 0;
            console.log("Inside reducer - Loop data:", action.payload);
        },
        appendLoopData: (state, action) => {
            // Append more loops (pagination)
            if (action.payload.loops) {
                state.loopData = [...state.loopData, ...action.payload.loops];
                state.currentPage = action.payload.currentPage || state.currentPage + 1;
                state.hasMore = action.payload.hasMore !== undefined ? action.payload.hasMore : false;
                state.totalPages = action.payload.totalPages || state.totalPages;
            }
        },
        clearLoopData: (state) => {
            state.loopData = [];
            state.totalPages = 1;
            state.currentPage = 1;
            state.hasMore = true;
            state.totalLoops = 0;
        },
    }
})

export const { setLoopData, appendLoopData, clearLoopData } = loopSlice.actions
export default loopSlice.reducer