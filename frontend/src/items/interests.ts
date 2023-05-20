import { Category } from "./post";
import { axiosInstance } from "../utils/authcontext";
import { ErrorResponse } from "../utils/response";
import { InterestCreateRequest } from "../utils/requests";

export const initInterestsAsync = async (): Promise<Category[]> =>{
    return new Promise((reslove, reject) =>{
        axiosInstance.get(`interests`).then((response)=>{
            if(response.status === 200 ){
                reslove(response.data as Category[]);
            }else{
                reject(response.data as ErrorResponse);
            }
        }).catch((error)=>{
            console.log(error);
            reject(error.response.data);
        });
    });
}

export const createInterestsAsync = async (request: InterestCreateRequest): Promise<{message: string}> =>{
    return new Promise((reslove, reject) =>{
        axiosInstance.post(`interests`, request).then((response)=>{
            if(response.status === 200 ){
                reslove(response.data as {message: string});
            }else{
                reject(response.data as ErrorResponse);
            }
        }).catch((error)=>{
            console.log(error);
            reject(error.response.data);
        });
    });
}