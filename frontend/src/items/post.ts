import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Json } from "../utils/util";

export interface Comment{
    id:string, userID:string, message: string, time: Date
}

export interface Post{
    id: string, 
    userID: string,
    category: string, 
    title: string,
    message: string,
    image?: string,
    time: string,
    views: number,
    likes: string[],
    dislikes: string[],
    comments: Comment[]
}

function init(): Map<string, Post[]>{
    let initOne: Post = { 
        id: "sdfg", userID: "sdfgh", title: "Java Programming", category: "Software", message: "java is a language of the gods", 
        time: new Date().toString(), views: 12, comments:[], likes:[], dislikes:[] };
    let initTwo: Post = { 
            id: "sdfg", userID: "sdfgh", title: "Java Programming", category: "Software", message: "java is a language of the gods", 
            time: new Date().toString(), views: 12, comments:[], likes:[], dislikes:[] };
    let initThree: Post = { 
        id: "sdfg", userID: "sdfgh", title: "Java Programming", category: "Software", message: "java is a language of the gods", 
        time: new Date().toString(), views: 12, comments:[], likes:[], dislikes:[] };
    let initFour: Post = { 
        id: "sdfg", userID: "sdfgh", title: "Java Programming", category: "Software", message: "java is a language of the gods", 
        time: new Date().toString(), views: 12, comments:[], likes:[], dislikes:[] };
    let initFive: Post = { 
        id: "sdfg", userID: "sdfgh", title: "Java Programming", category: "Software", message: "java is a language of the gods", 
        time: new Date().toString(), views: 12, comments:[], likes:[], dislikes:[] };
    let initSix: Post = { 
        id: "sdfg", userID: "sdfgh", title: "Java Programming", category: "Software", message: "java is a language of the gods", 
        time: new Date().toString(), views: 12, comments:[], likes:[], dislikes:[] };
    let initSeven: Post = { 
        id: "sdfg", userID: "sdfgh", title: "Java Programming", category: "Software", message: "java is a language of the gods", 
        time: new Date().toString(), views: 12, comments:[], likes:[], dislikes:[] };

    let map: Map<string, Post[]> = new Map();

    map.set("Latest", [initOne, initTwo, initThree, initFour, initFive, initSix, initSeven]);
    map.set(initOne.category, [initOne, initTwo, initThree, initFour, initFive, initSix, initSeven]);
    
    return map;
}

const initialState: string = Json.stringify(init());

export const postSlice = createSlice({
    name: "posts",
    initialState,
    reducers:{
        add: (state: string, action: PayloadAction<{ userID: string, title: string, category: string, message: string}>) =>{
            let id = "sdffggjhj";
            let time = new Date().toString();
            let init: Map<string, Post[]> = Json.parse(state);

            let post = { id, userID: action.payload.userID, title: action.payload.title, category: action.payload.category, message: action.payload.message, views: 0, time, comments:[], likes:[], dislikes:[] };
            if(init.has(action.payload.category)){
                init.get(action.payload.category)?.push(post);
            }else{
                init.set(action.payload.category, [post]);
            }

            if(init.has("Latest")){
                init.get("Latest")?.push(post);
            }else{
                init.set("Latest", [post]);
            }
            return Json.stringify(init);
        },
        remove: (state: string, action: PayloadAction<string>) =>{
            return state;
        },
        comment: (state: string, action: PayloadAction<{ userID: string, postID: string, category: string, message: string}>) =>{
            let id = "xcgghjk";
            let time = new Date();

            let init: Map<string, Post[]> = Json.parse(state);
            if(init.has(action.payload.category)){
                for(const post of (init.get(action.payload.category) as Post[])){
                    if(post.id === action.payload.postID){
                        post.comments.push({ id, time, userID: action.payload.userID, message: action.payload.message });
                        break;
                    }
                }
                return Json.stringify(init);
            }
            return state;
        },
        like: (state: string, action: PayloadAction<{ postID: string, category: string, userID: string}>) =>{
            let init: Map<string, Post[]> = Json.parse(state);
            if(init.has(action.payload.category)){
                for(const post of (init.get(action.payload.category) as Post[])){
                    post.likes.push(action.payload.userID);
                    if(post.dislikes.includes(action.payload.userID)){
                        post.dislikes.splice(post.dislikes.indexOf(action.payload.userID, 0), 1);
                    }
                    break;
                }
                return Json.stringify(init);
            }
            return state;
        },
        dislike: (state: string, action: PayloadAction<{ postID: string, category: string, userID: string}>) =>{
            let init: Map<string, Post[]> = Json.parse(state);
            if(init.has(action.payload.category)){
                for(const post of (init.get(action.payload.category) as Post[])){
                    if(post.id === action.payload.postID && !post.dislikes.includes(action.payload.userID)){
                        post.dislikes.push(action.payload.userID);
                        if(post.likes.includes(action.payload.userID)){
                            post.likes.splice(post.likes.indexOf(action.payload.userID, 0), 1);
                        }
                        break;
                    }
                }
                return Json.stringify(init);
            }
            return state;
        }
    }
});

export const { add, remove, like, dislike} = postSlice.actions;
export default postSlice.reducer;