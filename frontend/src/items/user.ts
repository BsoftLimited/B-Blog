import { AnyAction, createSlice, PayloadAction, ThunkAction } from "@reduxjs/toolkit";
import { axiosInstance } from "../utils/authcontext";
import { RootState } from "../utils/store";
import { LoginRequest, SignUpRequest } from "./requests";

export interface User{
    id?: string, name: string, surname: string, email: string
}

export interface Interest{
    id: string, name: string
}

export interface UserState { user?: User, interests: Interest[] }

const initState: UserState = { interests: [] };
export const userSlice = createSlice({
    name: "user", initialState: initState,
    reducers:{
        set: (state: UserState, action: PayloadAction<User>) =>{
            const init: UserState = {...state, user: action.payload };
            return init;
        },
        interests: (state: UserState,  action: PayloadAction<Interest[]>) =>{
            const init: UserState = {...state, interests: action.payload, };
            return init;
        },
        init: (state: UserState,  action: PayloadAction<{ user: User, interests: Interest[] }>) =>{
            const init: UserState =  action.payload;
            return init;
        }, 
        logout: (state: UserState,  action: PayloadAction) =>{
            const init: UserState =  {...state, user: undefined, interests: [] };
            return init;
        }
    }
});

export const signupAsync = (data: SignUpRequest, onStart: CallableFunction, onfailed: CallableFunction): ThunkAction<void, RootState, unknown,AnyAction> =>{
    return async(dispatch) =>{
        onStart();
        axiosInstance.post<User>('user/signup', data).then((response)=>{
            if(response.status === 200 ){
                dispatch(set(response.data));
            }else{
                onfailed(response.data);
            }
        }).catch((error) =>{
            onfailed(error.response.data);
        });
    }
}

export const interestsAsync = (data: string[], onStart: CallableFunction, onfailed: CallableFunction): ThunkAction<void, RootState, unknown,AnyAction> =>{
    return async(dispatch) =>{
        onStart();
        axiosInstance.post<Interest[]>('interests', data).then((response)=>{
            if(response.status === 200 ){
                dispatch(interests(response.data));
            }else{
               onfailed(response.data);
            }
        }).catch((error)=>{
            onfailed(error.response.data);
        });
    }
}

export const loginAsync = (data: LoginRequest, onStart: CallableFunction, onfailed: CallableFunction): ThunkAction<void, RootState, unknown,AnyAction> =>{
    return async(dispatch) =>{
        onStart();
        axiosInstance.post<User>('user/login', data).then((response)=>{
            if(response.status === 200 ){
                dispatch(set(response.data));
            }else{
               onfailed(response.data);
            }
        }).catch((error)=>{
            onfailed(error.response.data);
        });
    }
}

export const logoutAsync = (onStart: CallableFunction, onfinished: CallableFunction, onfailed: CallableFunction): ThunkAction<void, RootState, unknown,AnyAction> =>{
    return async(dispatch) =>{
        onStart();
        axiosInstance.get('user/logout').then((response)=>{
            if(response.status === 200 ){
                dispatch(logout());
                onfinished();
            }else{
               onfailed(response.data);
            }
        }).catch((error)=>{
            onfailed(error.response.data);
        });
    }
}

export const initAccountAsync = ( onStart: CallableFunction, onfinished: CallableFunction, onfailed: CallableFunction): ThunkAction<void, RootState, unknown,AnyAction> =>{
    return async(dispatch) =>{
        onStart();
        axiosInstance.get('user').then((response)=>{
            if(response.status === 200 ){
                dispatch(init(response.data));
                onfinished();
            }else{
               onfailed(response.data);
            }
        }).catch((error)=>{
        	console.log(error);
            onfailed(error.response.data);
        });
    }
}

export const { set, interests, init, logout } = userSlice.actions;
export default userSlice.reducer;