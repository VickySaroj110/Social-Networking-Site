import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        suggestedUser: [],
        profileData: null,
        following: [],
        toggleFollow: []
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload
            console.log("Inside reducer - User data:", action.payload);
        },
        setSuggestedUser: (state, action) => {
            state.suggestedUser = action.payload
            console.log("Inside reducer - Suggested data:", action.payload);
        },
        setProfileData: (state, action) => {
            state.profileData = action.payload
            console.log("Inside reducer - Profile data:", action.payload);
        },
        setFollowing: (state, action) => {
            state.following = action.payload
            console.log("Inside reducer - Following data:", action.payload);
        },
        toggleFollow: (state, action) => {
            const targetUserId = action.payload
            if (state.following.includes(targetUserId)) {
                state.following = state.following.filter(id => id !== targetUserId)
            } else {
                state.following.push(targetUserId)
            }
        }
    }
})

export const { setUserData, setSuggestedUser, setProfileData, setFollowing, toggleFollow } = userSlice.actions
export default userSlice.reducer
