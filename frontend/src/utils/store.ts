import { configureStore } from "@reduxjs/toolkit";
import userReduser from '../items/user';
import { useDispatch } from "react-redux";


const store = configureStore({
    reducer: {
        user: userReduser
    },
});

export type RootState = ReturnType<typeof store.getState>;
export const getUserSelector = (state: RootState) => state.user;

export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => AppDispatch = useDispatch;

export default store;