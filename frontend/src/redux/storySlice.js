import { createSlice } from "@reduxjs/toolkit";

const storySlice = createSlice({
    name: "story",
    initialState: {
        storyData: null,
        storyList: null,
        currentUserStory: null
    },
    reducers: {
        setStoryData: (state, action) => {
            state.storyData = action.payload
            console.log("Inside reducer - Story data:", action.payload);
        },
        setStoryList: (state, action) => {
            state.storyList = action.payload
            console.log("Inside reducer - Story List:", action.payload);
        },
        setCurrentUserStory: (state, action) => {
            state.currentUserStory = action.payload
            console.log("Inside reducer - Story current user story:", action.payload);
        },

        // ⭐ NEW REDUCER
        deleteStoryRedux: (state, action) => {
            if (state.storyList) {
                state.storyList = state.storyList.filter(
                    story => story._id !== action.payload
                )
            }
            if (state.currentUserStory?._id === action.payload) {
                state.currentUserStory = null
            }
        }
    }
})

export const { setStoryData , setStoryList, setCurrentUserStory, deleteStoryRedux } = storySlice.actions
export default storySlice.reducer
