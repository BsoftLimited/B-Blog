import { Post } from "../items/post";
import { useSelector } from 'react-redux';
import { useState } from "react";
import { getPostSelector } from "../utils/store";
import { Json } from "../utils/util";
 
export function Posts(){
    let init:Map<string, Post[]> =  Json.parse(useSelector(getPostSelector));
    
    //console.log(init.get("Latest"));
    return(<div>
        sdfghjklasdfghjk
    </div>);
}