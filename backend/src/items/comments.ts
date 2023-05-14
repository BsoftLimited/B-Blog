import express, { Response } from "express";
import mysql from "mysql2";
import Database from "../config/database";
import ErrorHandler from "../config/error";
import Session from "../config/session";
import uuid from "../utils";
import { User, UserDetails } from "./user";
import { CommentLikes } from "./likes";

export interface CommentDetails{
    id:string, user: UserDetails, message:  string
}

export class Comments {
    db: Database;
    error: ErrorHandler;

    constructor( db: Database, error: ErrorHandler){
        this.db = db;
        this.error = error;
    }
    
    async check_comment(postID: string, userID: string, message: string): Promise<boolean | undefined>{
        const init = await this.db.process(`SELECT * FROM Comments WHERE postID = ? AND userID = ? AND message = ?`, [postID, userID, message], "comments checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }

    async all(postID: string): Promise<CommentDetails[] | undefined>{
        let comments: CommentDetails[] = [];
        const init = await this.db.process(`SELECT * FROM Comments WHERE postID = ? ORDER BY time DESC`, [postID], "comments checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            for(let i = 0; i < rows.length; i++){
                const row = rows[0];
                let user  =  await new User(this.db, this.error).details(row.userID);
                if(user){
                    comments.push({ id: row.id, message: row.message, user: user});
                }else{
                    return undefined;
                }
            }
            return comments;
        }
        return undefined;
    }

    async count(postID: string): Promise<number | undefined>{
        const init = await this.db.process(`SELECT id FROM Comments WHERE postID = ? ORDER BY time DESC`, [postID], "comments checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length;
        }
        return undefined;
    }

    async write(response: Response, postID: string, id: string, message: string): Promise<Response<any, Record<string, any>>>{
        const session = new Session(this.db, this.error);
        const userID = await session.get(id);
        const commentID = uuid();
        if(userID && await this.check_comment(postID, userID, message)){
            return response.status(500).send({ message: "comment already exists"});
        }else if(userID){
            const init = await this.db.process(`INSERT INTO Comments SET id = ?, postID = ?, userID = ?, message = ?`, [commentID, postID, userID], "comment sent failed");
            const user = await new User(this.db, this.error).details(userID);
            if(init && user){
                return response.status(201).send({ id: commentID, message: message, user: user});
            }
        }
        return this.error.display(response);
    }

    async getAll(response: Response, postID: string): Promise<Response<any, Record<string, any>>>{
        const init = await this.all(postID);
        if(init){
            return response.status(200).send(init);
        }
        return this.error.display(response);
    }
}

export const commentRouter = express.Router();

commentRouter.post("/", (req, res) =>{
    if(req.cookies.blog && req.body.postID && req.body.message){
        const errorHandler = new ErrorHandler();
        const database = new Database(errorHandler);

        new Comments(database, errorHandler).write(res, req.body.postID, req.cookies.blog,  req.body.message).then((init) =>{
            if(init === undefined || errorHandler.has_error()){
                return errorHandler.display(res);
            }
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});

commentRouter.post("/like", (req, res) =>{
    if(req.body.id && req.cookies.blog){
        const errorHandler = new ErrorHandler();
        const database = new Database(errorHandler);

        new CommentLikes(database, errorHandler, req.body.id).like(res, req.cookies.blog).then((res) =>{
            return res;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});

commentRouter.post("/dislike", (req, res) =>{
    if(req.body.id && req.cookies.blog){
        const errorHandler = new ErrorHandler();
        const database = new Database(errorHandler);

        new CommentLikes(database, errorHandler, req.body.id).dislike(res, req.cookies.blog).then((res) =>{
            return res;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});