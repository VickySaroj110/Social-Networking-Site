import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
    name: "message",
    initialState: {
        selectedUser: null,
        messages: []
    },
    reducers: {
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload
            console.log("Inside reducer - Selected User:", action.payload);
        },
        setMessages: (state, action) => {
            state.messages = action.payload
            console.log("Inside reducer - Message:", action.payload);
        },
    }
})

export const { setSelectedUser, setMessages } = messageSlice.actions
export default messageSlice.reducer