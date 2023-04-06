import express, { Response } from "express";
import mysql from "mysql2";
import Database from "../config/database";
import ErrorHandler from "../config/error";
import Session from "../config/session";
import uuid, { report } from "../utils";

export class Interest {
    db: Database;
    error: ErrorHandler;
    ownerID: string;

    constructor(db: Database, error: ErrorHandler, ownerID: string){
        this.db = db;
        this.error = error;
        this.ownerID = ownerID;

    }
    
    async check(): Promise<boolean>{
        const init = await this.db.checkTable(`${this.ownerID}_interests`);
        if(init === 0){
            return this.db.createTable(`CREATE TABLE ${this.ownerID}_interests (id CHAR(50) NOT NULL PRIMARY KEY, name CHAR(50) NOT NULL)`);
        }
        return init == 1;
    }
    
    async check_interests(name: string): Promise<boolean | undefined>{
        const init = await this.db.process(`SELECT * FROM ${this.ownerID}_interests WHERE name = ?`, [name], "interest checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }

    async getAll(): Promise<{id: string, name: string }[]>{
        let interests: { id: string, name: string }[] = [];
        if(await this.check()){
            const init = await this.db.process(`SELECT * FROM ${this.ownerID}_interests`, [], "interest checking error");
            if(init){
                const rows = init as mysql.RowDataPacket[];
                rows.forEach(row => {
                    interests.push({ id: row.id, name: row.name});
                });
            }
        }
        return interests;
    }

    async write(interest: string): Promise<boolean>{
        try{
            if(await this.check()){
                if(await this.check_interests(interest)){
                    return true;
                }else{
                    let id = uuid();
                    const init = await this.db.process(`INSERT INTO ${this.ownerID}_interests SET id = ?, name = ?`, [id, interest.toLocaleLowerCase()], "interest addition failed");
                    if(init){
                        return true;
                    }
                }
            }
        }catch(error){
            this.error.add(500, JSON.stringify(error), "unknown server error");
        }
        return false;
    }

    async delete(response: Response, id: string): Promise<Response<any, Record<string, any>> | undefined>{
        try{
            if(await this.check()){
                if(await this.check_interests(id)){
                    const init = await this.db.process(`DELETE FROM ${this.ownerID}_interests WHERE id = ?`, [id], "interests delete failed");
                    if(init){
                        return response.status(200).send({ messeage: "succeeded", userID: id });
                    }else{
                        return response.status(500).send({ message: "interests server error" });
                    }
                }else{
                    return response.status(500).send({ message: "interests does not exists" });
                }
            }
        }catch(error){
            this.error.add(500, JSON.stringify(error), "unknown server error");
        }
        return undefined;
    }

    async all(response: Response): Promise<Response<any, Record<string, any>> | undefined>{
        try{
            if(await this.check()){
                const init = await this.getAll();
                return response.status(200).send(init);
            }
        }catch(error){
            this.error.add(500, JSON.stringify(error), "unknown server error");
        }
        return undefined;
    }
}

export const interestRouter = express.Router();

interestRouter.get("/", (req, res) =>{
    if(req.cookies.blog){
        const errorHandler = new ErrorHandler();
        const database = new Database(errorHandler);

        new Session(database, errorHandler).get(req.cookies.blog).then(userID =>{ 
            if(typeof userID === 'string'){
                new Interest(database, errorHandler, userID).all(res).then((init) =>{
                    if(init === undefined){
                        return report(res, "unknown server error", errorHandler);
                    }
                    return init;
                }).catch(error =>{ 
                    errorHandler.add(500, JSON.stringify(error), "unknown server error");
                    return report(res, "unknown server error", errorHandler);
                });
            }else{
                return report(res, "session expired or not found", errorHandler);
            }
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});

interestRouter.post("/",async (req, res) =>{
    if(req.cookies.blog && req.body.interests){
        const errorHandler = new ErrorHandler();
        const database = new Database(errorHandler);

        const userID = await new Session(database, errorHandler).get(req.cookies.blog);
        if(typeof userID === 'string'){
            for(let i = 0; i < req.body.interests.length; i++){
                const interest: string = req.body.interests[i];
                const init = await new Interest(database, errorHandler, userID).write(interest);
                if(!init){
                    return report(res, "unknown server error", errorHandler);
                }
            }
            return res.status(201).send({ messeage: "succeeded"});
        }else{
            return report(res, "session expired or not found", errorHandler);
        }
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});