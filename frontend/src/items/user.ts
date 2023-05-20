import { AnyAction, createSlice, PayloadAction, ThunkAction } from "@reduxjs/toolkit";
import { axiosInstance } from "../utils/authcontext";
import { RootState } from "../utils/store";
import { LoginRequest, SignUpRequest } from "../utils/requests";

export interface User{
    name: string, surname: string, email: string
}

export interface UserState { user?: User }

const initState: UserState = {};
export const userSlice = createSlice({
    name: "user", initialState: initState,
    reducers:{
        set: (state: UserState, action: PayloadAction<User>) =>{
            const init: UserState = {...state, user: action.payload };
            return init;
        },

        init: (state: UserState, action: PayloadAction<User>) =>{
            const init: UserState = {...state, user: action.payload };
            return init;
        },
        
        logout: (state: UserState,  action: PayloadAction) =>{
            const init: UserState =  {...state, user: undefined };
            return init;
        }
    }
});

export const signupAsync = (data: SignUpRequest, onStart: CallableFunction, onfailed: CallableFunction): ThunkAction<void, RootState, unknown,AnyAction> =>{
    return async(dispatch) =>{
        onStart();
        axiosInstance.post<User>('user/', data).then((response)=>{
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

export const loginAsync = (data: LoginRequest, onStart: CallableFunction, onFinished: CallableFunction, onfailed: CallableFunction): ThunkAction<void, RootState, unknown,AnyAction> =>{
    return async(dispatch) =>{
        onStart();
        axiosInstance.post<User>('user/login', data).then((response)=>{
            if(response.status === 200 ){
                dispatch(set(response.data));
                onFinished();
            }else{
               onfailed(response.data);
            }
        }).catch((error)=>{
            onfailed(error.response.data);
        });
    }
}

export const logoutAsync = (onfailed: CallableFunction): ThunkAction<void, RootState, unknown,AnyAction> =>{
    return async(dispatch) =>{
        axiosInstance.get('user/logout').then((response)=>{
            if(response.status === 200 ){
                dispatch(logout());
            }else{
            }
        }).catch((error)=>{
            onfailed(error.response.data);
        });
    }
}

export const initAccountAsync = ( onStart?: CallableFunction, onfinished?: CallableFunction, onfailed?: CallableFunction): ThunkAction<void, RootState, unknown,AnyAction> =>{
    return async(dispatch) =>{
        if(onStart){ onStart(); }
        axiosInstance.get('user').then((response)=>{
            if(response.status === 200 ){
                dispatch(init(response.data));
                if(onfinished){ onfinished(); }
            }else{
                console.log(response.data);
               if(onfailed){ onfailed(response.data); } 
            }
        }).catch((error)=>{
        	console.log(error.response.data);
            if(onfailed){ onfailed(error.response.data); }
        });
    }
}

export const { set, init, logout } = userSlice.actions;
export default userSlice.reducer;