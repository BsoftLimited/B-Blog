import express, { Response } from "express";
import mysql from "mysql2";
import Database from "../config/database";
import ErrorHandler from "../config/error";
import Session from "../config/session";

export class Likes {
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
            return this.db.createTable(`CREATE TABLE ${this.ownerID}_likes (userID CHAR(50) NOT NULL PRIMARY KEY, like BOOLEAN NOT NULL)`);
        }
        return init == 1;
    }
    
    async check_likes(userID: string): Promise<boolean | undefined>{
        const init = await this.db.process(`SELECT * FROM ${this.ownerID}_likes WHERE userID = ?`, [userID], "likes checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }

    async get(userID: string): Promise<boolean| undefined>{
        const init = await this.db.process(`SELECT * FROM ${this.ownerID}_likes WHERE userID = ?`, [userID], "likes checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows[0].like === 1;
        }
        return undefined;
    }

    async likes(): Promise<number>{
        try{
            if(await this.check()){
                const init = await this.db.process(`SELECT * FROM ${this.ownerID}_likes WHERE like = ?`, [true], "likes checking error");
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

    async dislikes(): Promise<number>{
        try{
            if(await this.check()){
                const init = await this.db.process(`SELECT * FROM ${this.ownerID}_likes WHERE like = ?`, [false], "likes checking error");
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

    async doI(userID: string): Promise<boolean| undefined>{
        try{
            if(await this.check()){
                const init = await this.db.process(`SELECT * FROM ${this.ownerID}_likes WHERE userID = ?`, [userID], "likes checking error");
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

    async write(response: Response, id: string, like: boolean): Promise<Response<any, Record<string, any>> | undefined>{
        try{
            const userID = await new Session(this.db, this.error).get(id);
            if(userID && await this.check()){
                if(await this.check_likes(userID)){
                    return this.update(response, id, like);
                }else{
                    const init = await this.db.process(`INSERT INTO ${this.ownerID}_likes SET userID = ?, like = ?`, [userID, like], "like failed");
                    if(init){
                        return response.status(201).send({ messeage: "succeeded", userID: id, like: like });
                    }else{
                        return response.status(500).send({ message: "like and unlike server error" });
                    }
                }
            }
        }catch(error){
            this.error.add(500, JSON.stringify(error), "unknown server error");
        }
        return undefined;
    }

    async update(response: Response, id: string, like: boolean): Promise<Response<any, Record<string, any>> | undefined>{
        try{
            const userID = await new Session(this.db, this.error).get(id);
            if(userID && await this.check()){
                if(await this.check_likes(userID)){
                    return response.status(500).send({ message: ""});
                }else{
                    const init = await this.db.process(`UPDATE ${this.ownerID}_likes SET like = ? WHERE userID = ?`, [like, userID], "like failed");
                    if(init){
                        return response.status(201).send({ messeage: "succeeded", userID: id, like: like });
                    }else{
                        return response.status(500).send({ message: "like and unlike server error" });
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
            const userID = await new Session(this.db, this.error).get(id);
            if(userID && await this.check()){
                if(await this.check_likes(userID)){
                    const init = await this.db.process(`DELETE FROM ${this.ownerID}_likes WHERE userID = ?`, [userID], "like delete failed");
                    if(init){
                        return response.status(201).send({ messeage: "succeeded", userID: id });
                    }else{
                        return response.status(500).send({ message: "like and unlike server error" });
                    }
                }
            }
        }catch(error){
            this.error.add(500, JSON.stringify(error), "unknown server error");
        }
        return undefined;
    }

    async like(response: Response, id: string): Promise<Response<any, Record<string, any>> | undefined>{
        try{
            const userID = await new Session(this.db, this.error).get(id);
            if(userID && await this.check()){
                if(await this.check_likes(userID) && await this.get(userID) === true){
                    return this.delete(response, id);
                }else{
                    return this.write(response, id, true);
                }
            }else{
                return response.status(500).send({ message: "session or server error" });
            }
        }catch(error){
            this.error.add(500, JSON.stringify(error), "server error");
        }
        return undefined;
    }

    async dislike(response: Response, id: string): Promise<Response<any, Record<string, any>> | undefined>{
        try{
            const userID = await new Session(this.db, this.error).get(id);
            if(userID && await this.check()){
                if(await this.check_likes(userID) && await this.get(userID) === false){
                    return this.delete(response, id);
                }else{
                    return this.write(response, id, false);
                }
            }else{
                return response.status(500).send({ message: "session or server error" });
            }
        }catch(error){
            this.error.add(500, JSON.stringify(error), "server error");
        }
        return undefined;
    }
}

export const likeRouter = express.Router();

likeRouter.post("/like", (req, res) =>{
    if(req.body.ownerID && req.body.id){
        const errorHandler = new ErrorHandler();
        const database = new Database(errorHandler);

        new Likes(database, errorHandler, req.body.ownerID).like(res, req.body.id).then((init) =>{
            if(init === undefined || errorHandler.has_error()){
                return errorHandler.display(res);
            }
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});

likeRouter.post("/dislike", (req, res) =>{
    if(req.body.ownerID && req.body.id){
        const errorHandler = new ErrorHandler();
        const database = new Database(errorHandler);

        new Likes(database, errorHandler, req.body.ownerID).dislike(res, req.body.id).then((init) =>{
            if(init === undefined || errorHandler.has_error()){
                return errorHandler.display(res);
            }
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});