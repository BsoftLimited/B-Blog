import express, { Response } from "express";
import mysql from "mysql2";
import Database from "../config/database";
import ErrorHandler from "../config/error";
import Session from "../config/session";
import { User, UserDetails } from "./user";

class Likes {
    db: Database;
    error: ErrorHandler;
    table: string;
    ownerID: string;
    ownerField: string

    constructor(db: Database, error: ErrorHandler, table: string, ownerID: string, ownerField: string){
        this.db = db;
        this.error = error;
        this.table = table;
        this.ownerID = ownerID;
        this.ownerField = ownerField;

    }
    
    async check_likes(userID: string): Promise<boolean | undefined>{
        const init = await this.db.process(`SELECT * FROM ${this.table} WHERE ${this.ownerField} = ? AND userID = ?`, [this.ownerID, userID], "likes checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }

    async get(userID: string): Promise<boolean| undefined>{
        const init = await this.db.process(`SELECT * FROM ${this.table} WHERE ${this.ownerField} = ? AND userID = ?`, [this.ownerID, userID], "likes checking error");
        const rows = init as mysql.RowDataPacket[];
        if(init && rows.length > 0){
            return rows[0].like === "1";
        }
        return undefined;
    }

    async likes_count(): Promise<number | undefined>{
        const init = await this.db.process(`SELECT * FROM ${this.table} WHERE ${this.ownerField} = ? AND likes = ?`, [this.ownerID, true], "likes checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length;
        }
        return undefined;
    }

    async likes(): Promise<UserDetails[] | undefined>{
        const init = await this.db.process(`SELECT * FROM ${this.table} WHERE ${this.ownerField} = ? AND likes = ?`, [this.ownerID, true], "likes checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            let users: UserDetails[] = [];
            let userInstance = new User(this.db, this.error);
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
        const init = await this.db.process(`SELECT * FROM ${this.table} WHERE ${this.ownerField} = ? AND likes = ?`, [this.ownerID, false], "dislikes checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length;
        }
        return undefined;
    }

    async dislikes(): Promise<UserDetails[] | undefined>{
        const init = await this.db.process(`SELECT * FROM ${this.table} WHERE ${this.ownerField} = ? AND likes = ?`, [this.ownerID, false], "likes checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            let users: UserDetails[] = [];
            let userInstance = new User(this.db, this.error);
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
        const userID = await new Session(this.db, this.error).get(id);
        if(userID){
            if(await this.check_likes(userID)){
                return this.update(response, id, like);
            }else{
                const init = await this.db.process(`INSERT INTO ${this.table} SET ${this.ownerField} = ?, userID = ?, likes = ?`, [this.ownerID, userID, like], "like and unlike server error");
                if(init){
                    return response.status(201).send({ messeage: "succeeded", userID: id, like: like });
                }
            }
        }
        return this.error.display(response);
    }

    async update(response: Response, id: string, like: boolean): Promise<Response<any, Record<string, any>>>{
        const userID = await new Session(this.db, this.error).get(id);
        if(userID){
            if(await this.check_likes(userID)){
                return response.status(500).send({ message: ""});
            }else{
                const init = await this.db.process(`UPDATE ${this.table} SET likes = ? WHERE userID = ? AND ${this.ownerField} = ?`, [like, userID, this.ownerID], "like and unlike server error");
                if(init){
                    return response.status(201).send({ messeage: "succeeded", userID: id, like: like });
                }
            }
        }
        return this.error.display(response);
    }

    async delete(response: Response, id: string): Promise<Response<any, Record<string, any>>>{
        const userID = await new Session(this.db, this.error).get(id);
        if(userID){
            if(await this.check_likes(userID)){
                const init = await this.db.process(`DELETE FROM ${this.table} WHERE ${this.ownerField} = ? AND userID = ?`, [this.ownerID, userID], "like delete failed");
                if(init){
                    return response.status(200).send({ messeage: "succeeded"});
                }
            }
        }
        return this.error.display(response);
    }

    async like(response: Response, id: string): Promise<Response<any, Record<string, any>>>{
        const userID = await new Session(this.db, this.error).get(id);
        if(userID){
            if(await this.check_likes(userID) && await this.get(userID) === true){
                return this.delete(response, id);
            }else{
                return this.write(response, id, true);
            }
        }
        return this.error.display(response);
    }

    async dislike(response: Response, id: string): Promise<Response<any, Record<string, any>> | undefined>{
        const userID = await new Session(this.db, this.error).get(id);
        if(userID){
            if(await this.check_likes(userID) && await this.get(userID) === false){
                return this.delete(response, id);
            }else{
                return this.write(response, id, false);
            }
        }
        return this.error.display(response);
    }

    async doI(userID: string): Promise<boolean | undefined>{
        if(await this.check_likes(userID)){
            return await this.get(userID) === true;
        }
        return undefined;
    }
}

export class PostLikes extends Likes{
    constructor(db: Database, error: ErrorHandler, postID: string){
        super(db,  error, "PostLikes", postID, "postID");
    }
}

export class CommentLikes extends Likes{
    constructor(db: Database, error: ErrorHandler, commentID: string){
        super(db,  error, "CommentsLikes", commentID, "commentID");
    }
}