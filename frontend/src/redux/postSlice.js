import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
    name: "post",
    initialState: {
        postData: [],
        totalPages: 1,
        currentPage: 1,
        hasMore: true,
        totalPosts: 0,
    },
    reducers: {
        setPostData: (state, action) => {
            // Set initial data (first page)
            state.postData = action.payload.posts || action.payload
            state.totalPages = action.payload.totalPages || 1
            state.currentPage = action.payload.currentPage || 1
            state.hasMore = action.payload.hasMore !== undefined ? action.payload.hasMore : true
            state.totalPosts = action.payload.totalPosts || 0
            console.log("Inside reducer - post data:", action.payload);
        },
        appendPostData: (state, action) => {
            // Append more posts (pagination)
            if (action.payload.posts) {
                state.postData = [...state.postData, ...action.payload.posts]
                state.currentPage = action.payload.currentPage || state.currentPage + 1
                state.hasMore = action.payload.hasMore !== undefined ? action.payload.hasMore : false
                state.totalPages = action.payload.totalPages || state.totalPages
            }
        },
        clearPostData: (state) => {
            state.postData = []
            state.totalPages = 1
            state.currentPage = 1
            state.hasMore = true
            state.totalPosts = 0
        }
    }
})

export const { setPostData, appendPostData, clearPostData } = postSlice.actions
export default postSlice.reducer