import express, { Response } from "express";
import mysql from "mysql2";
import Session from "../config/session";
import { User, UserDetails } from "./user";
import db from "../config/database";

class Likes {
    table: string;
    ownerID: string;
    ownerField: string

    constructor(table: string, ownerID: string, ownerField: string){
        this.table = table;
        this.ownerID = ownerID;
        this.ownerField = ownerField;

    }
    
    async check_likes(userID: string): Promise<boolean | undefined>{
        const init = await db.process(`SELECT * FROM ${this.table} WHERE ${this.ownerField} = ? AND userID = ?`, [this.ownerID, userID], "likes checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }

    async get(userID: string): Promise<boolean| undefined>{
        const init = await db.process(`SELECT * FROM ${this.table} WHERE ${this.ownerField} = ? AND userID = ?`, [this.ownerID, userID], "likes checking error");
        const rows = init as mysql.RowDataPacket[];
        if(init && rows.length > 0){
            return rows[0].like === "1";
        }
        return undefined;
    }

    async likes_count(): Promise<number | undefined>{
        const init = await db.process(`SELECT * FROM ${this.table} WHERE ${this.ownerField} = ? AND likes = ?`, [this.ownerID, true], "likes checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length;
        }
        return undefined;
    }

    async likes(): Promise<UserDetails[] | undefined>{
        const init = await db.process(`SELECT * FROM ${this.table} WHERE ${this.ownerField} = ? AND likes = ?`, [this.ownerID, true], "likes checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            let users: UserDetails[] = [];
            let userInstance = new User();
            for(let i = 0; i < rows.length; i++){
                const row = rows[i];
                let user = await userInstance.details(row.userID);
                if(user){
                    users.push(user);
                }else{
                    return undefined;
                }
            }
            return users;
        }
        return undefined;
    }

    async dislikes_count(): Promise<number | undefined>{
        const init = await db.process(`SELECT * FROM ${this.table} WHERE ${this.ownerField} = ? AND likes = ?`, [this.ownerID, false], "dislikes checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length;
        }
        return undefined;
    }

    async dislikes(): Promise<UserDetails[] | undefined>{
        const init = await db.process(`SELECT * FROM ${this.table} WHERE ${this.ownerField} = ? AND likes = ?`, [this.ownerID, false], "likes checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            let users: UserDetails[] = [];
            let userInstance = new User();
            for(let i = 0; i < rows.length; i++){
                const row = rows[i];
                let user = await userInstance.details(row.userID);
                if(user){
                    users.push(user);
                }else{
                    return undefined;
                }
            }
            return users;
        }
        return undefined;
    }

    async write(response: Response, id: string, like: boolean): Promise<Response<any, Record<string, any>>>{
        const userID = await new Session().get(id);
        if(userID){
            if(await this.check_likes(userID)){
                return this.update(response, id, like);
            }else{
                const init = await db.process(`INSERT INTO ${this.table} SET ${this.ownerField} = ?, userID = ?, likes = ?`, [this.ownerID, userID, like], "like and unlike server error");
                if(init){
                    return response.status(201).send({ messeage: "succeeded", userID: id, like: like });
                }
            }
        }
        return db.errorHandler.display(response);
    }

    async update(response: Response, id: string, like: boolean): Promise<Response<any, Record<string, any>>>{
        const userID = await new Session().get(id);
        if(userID){
            if(await this.check_likes(userID)){
                return response.status(500).send({ message: ""});
            }else{
                const init = await db.process(`UPDATE ${this.table} SET likes = ? WHERE userID = ? AND ${this.ownerField} = ?`, [like, userID, this.ownerID], "like and unlike server error");
                if(init){
                    return response.status(201).send({ messeage: "succeeded", userID: id, like: like });
                }
            }
        }
        return db.errorHandler.display(response);
    }

    async delete(response: Response, id: string): Promise<Response<any, Record<string, any>>>{
        const userID = await new Session().get(id);
        if(userID){
            if(await this.check_likes(userID)){
                const init = await db.process(`DELETE FROM ${this.table} WHERE ${this.ownerField} = ? AND userID = ?`, [this.ownerID, userID], "like delete failed");
                if(init){
                    return response.status(200).send({ messeage: "succeeded"});
                }
            }
        }
        return db.errorHandler.display(response);
    }

    async like(response: Response, id: string): Promise<Response<any, Record<string, any>>>{
        const userID = await new Session().get(id);
        if(userID){
            if(await this.check_likes(userID) && await this.get(userID) === true){
                return this.delete(response, id);
            }else{
                return this.write(response, id, true);
            }
        }
        return db.errorHandler.display(response);
    }

    async dislike(response: Response, id: string): Promise<Response<any, Record<string, any>> | undefined>{
        const userID = await new Session().get(id);
        if(userID){
            if(await this.check_likes(userID) && await this.get(userID) === false){
                return this.delete(response, id);
            }else{
                return this.write(response, id, false);
            }
        }
        return db.errorHandler.display(response);
    }

    async doI(userID: string): Promise<boolean | undefined>{
        if(await this.check_likes(userID)){
            return await this.get(userID) === true;
        }
        return undefined;
    }
}

export class PostLikes extends Likes{
    constructor( postID: string){
        super("PostLikes", postID, "postID");
    }
}

export class CommentLikes extends Likes{
    constructor(commentID: string){
        super("CommentsLikes", commentID, "commentID");
    }
}