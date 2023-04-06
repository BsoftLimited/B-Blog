import express, { Response } from "express";
import mysql from "mysql2";
import Database from "../config/database";
import ErrorHandler from "../config/error";
import Session from "../config/session";
import { User, UserDatails } from "./user";

export class Views {
    db: Database;
    error: ErrorHandler;
    ownerID: string;

    constructor(db: Database, error: ErrorHandler, ownerID: string){
        this.db = db;
        this.error = error;
        this.ownerID = ownerID;
    }
    
    async check(): Promise<boolean>{
        const init = await this.db.checkTable(`${this.ownerID}_likes`);
        if(init === 0){
            return this.db.createTable(`CREATE TABLE ${this.ownerID}_views (userID CHAR(50) NOT NULL PRIMARY KEY, time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
        }
        return init == 1;
    }
    
    async check_views(userID: string): Promise<boolean | undefined>{
        const init = await this.db.process(`SELECT * FROM ${this.ownerID}_views WHERE userID = ?`, [userID], "views checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }

    async get(userID: string): Promise<boolean| undefined>{
        const init = await this.db.process(`SELECT * FROM ${this.ownerID}_views WHERE userID = ?`, [userID], "views checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows[0].like === 1;
        }
        return undefined;
    }

    async count(): Promise<number>{
        try{
            if(await this.check()){
                const init = await this.db.process(`SELECT * FROM ${this.ownerID}_views`, [], "views checking error");
                if(init){
                    const rows = init as mysql.RowDataPacket[];
                    return rows.length;
                }
            }
        }catch(error){
            this.error.add(500, JSON.stringify(error), "unknown server error");
        }
        return 0;
    }

    async didI(userID: string): Promise<boolean| undefined>{
        try{
            if(await this.check()){
                const init = await this.db.process(`SELECT * FROM ${this.ownerID}_views WHERE userID = ?`, [userID], "views checking error");
                if(init){
                    const rows = init as mysql.RowDataPacket[];
                    return rows[0].like === 1;
                }
            }
        }catch(error){
            this.error.add(500, JSON.stringify(error), "unknown server error");
        }
        return undefined;
    }

    async write(response: Response, id: string): Promise<Response<any, Record<string, any>> | undefined>{
        try{
            const userID = await new Session(this.db, this.error).get(id);
            if(userID && await this.check()){
                if(await this.check_views(userID)){
                    return response.status(201).send({ messeage: "succeeded"});
                }else{
                    const init = await this.db.process(`INSERT INTO ${this.ownerID}_views SET userID = ?`, [userID], "views failed");
                    if(init){
                        return response.status(201).send({ messeage: "succeeded" });
                    }else{
                        return response.status(500).send({ message: "views server error" });
                    }
                }
            }
        }catch(error){
            this.error.add(500, JSON.stringify(error), "unknown server error");
        }
        return undefined;
    }

    async views(): Promise<UserDatails[]>{
        let init: UserDatails[] = [];
        try{
            if(await this.check()){
                const result = await this.db.process(`SELECT * FROM ${this.ownerID}_views`, [], "views checking error");
                if(result){
                    const rows = result as mysql.RowDataPacket[];
                    rows.forEach(async row => {
                        const details = await new User(this.db, this.error).details(row.userID);
                        if(details){
                            init.push(details);
                        }
                    });
                }
            }
        }catch(error){
            this.error.add(500, JSON.stringify(error), "server error");
        }
        return init;
    }
}

export const viewsRouter = express.Router();

viewsRouter.post("/", (req, res) =>{
    if(req.cookies.blog, req.body.postID){
        const errorHandler = new ErrorHandler();
        const database = new Database(errorHandler);

        new Views(database, errorHandler, req.body.postID).write(res, req.cookies.blog).then((init) =>{
            if(init === undefined || errorHandler.has_error()){
                return errorHandler.display(res);
            }
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});