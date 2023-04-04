import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User{
    id: string, name: string, username: string
}

export interface UserInfo{
    active: boolean, user: User| undefined
}

const initialState: UserInfo = { active: false, user: undefined};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers:{
        login: (state: UserInfo, action: PayloadAction<{ username: string, password: string}>) =>{
            let id = "cdfghjkl";
            return { active: true, user: { id, name: "Okelekele", username: action.payload.username}};
        },
        logout: (state: UserInfo, action: PayloadAction) =>{
            return { active: false, user: undefined};
        },
    }
});

export const { login, logout} = userSlice.actions;
export default userSlice.reducer;