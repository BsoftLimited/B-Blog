import express, { Response } from "express";
import mysql from "mysql2";
import Database from "../config/database";
import ErrorHandler from "../config/error";
import Session from "../config/session";
import uuid from "../utils";

export class Comments {
    db: Database;
    error: ErrorHandler;
    postID: string;

    constructor(postID: string, db: Database, error: ErrorHandler){
        this.db = db;
        this.error = error;
        this.postID = postID;
    }
    
    async check(): Promise<boolean>{
        const init = await this.db.checkTable(`${this.postID}_comments`);
        if(init === 0){
            return this.db.createTable(`CREATE TABLE ${this.postID}_comments (id CHAR(50) NOT NULL PRIMARY KEY, userID CHAR(30) NOT NULL, message CHAR(30) NOT NULL)`);
        }
        return init == 1;
    }
    
    async check_comment(userID: string, message: string): Promise<boolean | undefined>{
        const init = await this.db.process(`SELECT * FROM ${this.postID}_comments WHERE userID = ? AND message = ?`, [userID, message], "comments checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }

    async getAll(): Promise<{id: string, message: string }[]>{
        let comments: { id: string, message: string }[] = [];
        if(await this.check()){
            const init = await this.db.process(`SELECT * FROM ${this.postID}_comments`, [], "comments checking error");
            if(init){
                const rows = init as mysql.RowDataPacket[];
                rows.forEach(row => {
                    comments.push({ id: row.id, message: row.message});
                });
            }
        }
        return comments;
    }

    async write(response: Response, id: string, message: string): Promise<Response<any, Record<string, any>> | undefined>{
        try{
            if(await this.check()){
                const session = new Session(this.db, this.error);
                const userID = await session.get(id);
                const commentID = uuid();
                if(userID && await this.check_comment(userID, message)){
                    return response.status(500).send({ message: "user with the same email already exists"});
                }else{
                    const init = await this.db.process(`INSERT INTO ${this.postID}_comments SET id = ?, userID = ?, message = ?`, [commentID, userID], "comment sent failed");
                    if(init){
                        return response.status(201).send({ id: commentID, message: message});
                    }else{
                        return response.status(500).send({ message: "session creation failed, but registrated succesfully, try login in" });
                    }
                }
            }
        }catch(error){
            console.log(error);
        }
        return response.status(500).send({ message: "unknown server errror" });
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

export const commentRouter = express.Router();

commentRouter.post("/", (req, res) =>{
    if(req.cookies.blog, req.body.id){
        const errorHandler = new ErrorHandler();
        const database = new Database(errorHandler);

        new Comments(req.body.id, database, errorHandler).all(res).then((init) =>{
            if(init === undefined || errorHandler.has_error()){
                return errorHandler.display(res);
            }
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});

commentRouter.post("/create", (req, res) =>{
    if(req.cookies.blog && req.body.id && req.body.message){
        const errorHandler = new ErrorHandler();
        const database = new Database(errorHandler);

        new Comments(req.body.id, database, errorHandler).write(res, req.cookies.blog,  req.body.message).then((init) =>{
            if(init === undefined || errorHandler.has_error()){
                return errorHandler.display(res);
            }
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});