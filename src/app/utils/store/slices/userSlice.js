import { createSlice } from "@reduxjs/toolkit"

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user:{
            user:null
        }
    },
    reducers: {
        setUser : (state, action) => {
            state.user = action.payload
                },
        logout : (state) => {
            state.name = {}
        }
    }
})  

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;