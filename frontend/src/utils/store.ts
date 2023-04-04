import { configureStore } from "@reduxjs/toolkit";
import postReduser from '../items/post';
import userReduser from '../items/user';


const store = configureStore({
    reducer: {
        post: postReduser,
        user: userReduser
    },
});

export type RootState = ReturnType<typeof store.getState>;
export const getPostSelector = (state: RootState) => state.post;
export const getUserSelector = (state: RootState) => state.user;
export default store;