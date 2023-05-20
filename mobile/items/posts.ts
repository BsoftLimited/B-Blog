import { axiosInstance } from "../utils/connection";
import { CategoryPostsResponse, ErrorResponse, HomePageResponse, ViewPostResponse } from "../utils/reponse";
import { PostCreateRequest } from "../utils/requests";
import { User } from "./user";

export interface Comment{
    id:string, userID:string, message: string, time: Date
}

export interface Category{
    id: string, name: string, slurg: string
}

export interface Post{ 
    id: string, title: string, message: string, owner: User, created: string,
    comments: number, categories: Category[], views: number,
    likes:{
        likes: number, dislikes: number, doI?: boolean }
}

export interface SinglePost{ 
    id: string, title: string, message: string, owner: User, created: string,
    comments: Comment[], categories: Category[], views: User[],
    likes:{
        likes: User[], dislikes: User[], doI?: boolean }
}


export const initPostsAsync = async (): Promise<HomePageResponse> =>{
    return new Promise((reslove, reject) =>{
        axiosInstance.get('posts').then((response)=>{
            if(response.status === 200 ){
                reslove(response.data as HomePageResponse);
            }else{
                reject(response.data as ErrorResponse);
            }
        }).catch((error)=>{
            console.log(error);
            reject(error.response.data);
        });
    });
}

export const initSinglePostsAsync = async (postID: string): Promise<ViewPostResponse> =>{
    return new Promise((reslove, reject) =>{
        axiosInstance.get(`posts/${postID}`).then((response)=>{
            if(response.status === 200 ){
                reslove(response.data as ViewPostResponse);
            }else{
                reject(response.data as ErrorResponse);
            }
        }).catch((error)=>{
            console.log(error);
            reject(error.response.data);
        });
    });
}

export const createPostAsync = async (request: PostCreateRequest): Promise<{message: string}> =>{
    return new Promise((reslove, reject) =>{
        axiosInstance.post('posts', request).then((response)=>{
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

export const initCategoriesAsync = async (): Promise<Category[]> =>{
    return new Promise((reslove, reject) =>{
        axiosInstance.get('posts/categories').then((response)=>{
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


export const initCategoryPostAsync = async (categorySlurg: string): Promise<CategoryPostsResponse> =>{
    return new Promise((reslove, reject) =>{
        axiosInstance.get(`posts/categories/${categorySlurg}`).then((response)=>{
            if(response.status === 200 ){
                reslove(response.data as CategoryPostsResponse);
            }else{
                reject(response.data as ErrorResponse);
            }
        }).catch((error)=>{
            console.log(error);
            reject(error.response.data);
        });
    });
}
