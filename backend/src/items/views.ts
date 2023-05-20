import express, { Response } from "express";
import mysql from "mysql2";
import Session from "../config/session";
import { User, UserDetails} from "./user";
import db from "../config/database";

export interface ViewsDetails{
    postID: string,
    user: UserDetails
    time: string
}

export class Views {
    async check_views(postID: string, userID: string): Promise<boolean | undefined>{
        const init = await db.process(`SELECT * FROM Views WHERE postID = ? AND userID = ?`, [postID, userID], "views checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }

    async all(postID: string): Promise<ViewsDetails[]| undefined>{
        const init = await db.process(`SELECT * FROM Views WHERE postID = ?`, [postID], "views checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            let views: ViewsDetails[] = [];
            for(let i = 0; i < rows.length; i++){
                const  row = rows[0];
                let user = await new User().details(row.userID);
                if(user){
                    views.push({postID: postID, user: user, time: row.time});
                }else{
                    return undefined;
                }
            }
            return views;
        }
        return undefined;
    }

    async count(postID: string): Promise<number|undefined>{
        const init = await db.process(`SELECT * FROM Views WHERE postID = ?`, [postID], "views checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length;
        }
        return undefined;
    }

    async didI(postID: string, userID: string): Promise<boolean| undefined>{
        const init = await db.process(`SELECT * FROM Views WHERE postID = ? AND userID = ?`, [postID, userID], "views checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }

    async add(postID: string, userID: string): Promise<boolean | undefined>{
        const init = await db.process(`INSERT INTO Views SET postID = ? AND userID = ?`, [postID, userID], "views failed");
        if(init){
            return true;
        }
        return undefined;
    }

    async write(response: Response, postID: string, id: string): Promise<Response<any, Record<string, any>>>{
        const userID = await new Session().get(id);
        if(userID){
            if(await this.check_views(postID, userID)){
                return response.status(201).send({ messeage: "succeeded"});
            }else{
                const init = await this.add(postID, userID);
                if(init){
                    return response.status(201).send({ messeage: "succeeded" });
                }
            }
        }
        return db.errorHandler.display(response);
    }

    async getAll(response: Response, postID: string): Promise<Response<any, Record<string, any>>>{
        let init = this.all(postID);
        if(init){
            return response.status(200).send(init);
        }
        return  db.errorHandler.display(response);
    }
}