import express, { Response } from "express";
import mysql from "mysql2";
import Database from "../config/database";
import ErrorHandler from "../config/error";
import Session from "../config/session";
import { report } from "../utils";

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

    async write(response: Response, interest: string): Promise<Response<any, Record<string, any>> | undefined>{
        try{
            if(await this.check()){
                if(await this.check_interests(interest)){
                    return response.status(500).send({ messeage: "interest already exist"});
                }else{
                    const init = await this.db.process(`INSERT INTO ${this.ownerID}_interests SET interest = ?`, [interest], "interest addition failed");
                    if(init){
                        return response.status(201).send({ messeage: "succeeded"});
                    }
                }
            }
        }catch(error){
            this.error.add(500, JSON.stringify(error), "unknown server error");
        }
        return undefined;
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
    if(req.headers.cookie){
        const errorHandler = new ErrorHandler();
        const database = new Database(errorHandler);
        const session = new Session(database, errorHandler);

        session.get(req.body.id).then(userID =>{
            if(userID){
                new Interest(database, errorHandler, req.body.id).all(res).then((init) =>{
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

interestRouter.post("/", (req, res) =>{
    if(req.body.id){
        const errorHandler = new ErrorHandler();
        const database = new Database(errorHandler);
        const session = new Session(database, errorHandler);

        session.get(req.body.id).then(userID =>{
            if(userID){
                new Interest(database, errorHandler, req.body.id).all(res).then((init) =>{
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