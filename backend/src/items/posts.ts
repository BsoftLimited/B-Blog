import Database from "../config/database";
import ErrorHandler from "../config/error";
import mysql from "mysql2";
import express, { Response } from "express";
import Session from "../config/session";
import uuid from "../utils";

class Categories {
    db: Database;
    error: ErrorHandler;
    postID: string;

    constructor(postID: string, db: Database, error: ErrorHandler){
        this.db = db;
        this.error = error;
        this.postID = postID;
    }
    
    async check(): Promise<boolean>{
        const init = await this.db.checkTable(`${this.postID}_categories`);
        if(init === 0){
            return this.db.createTable(`CREATE TABLE ${this.postID}_categories (name CHAR(30) NOT NULL PRIMARY KEY)`);
        }
        return init == 1;
    }
    
    async check_categories(name: string): Promise<boolean | undefined>{
        const init = await this.db.process(`SELECT * FROM ${this.postID}_categories WHERE name = ?`, [name], "post categories checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }

    async write(names: string[]): Promise<boolean>{
        let ok = true;
        if(await this.check()){
            names.forEach(async (name) =>{
                try{
                    if(await this.check_categories(name) === false){
                        await this.db.process(`INSERT INTO ${this.postID}_categories SET name = ?`, [name], `post category ${name} addition failed`);
                    }
                }catch(error){
                    this.error.add(500, JSON.stringify(error), "server error");
                    ok = false;
                }
            });
        }
        return ok;
    }

    async delete(response: Response, name: string): Promise<Response<any, Record<string, any>> | undefined>{
        try{
            const init = await this.db.process(`DELETE FROM ${this.postID}_categories WHERE name = ?`, [name], `post category ${name} deletion failed`);
            if(init){
                return response.status(201).send({ message: `category ${name} deletion success` });
            }
        }catch(error){
            console.log(error);
        }
        return response.status(500).send({ message: "unknown server errror" });
    }
}

export default class Post {
    db: Database;
    error: ErrorHandler;

    constructor(db: Database, error: ErrorHandler){
        this.db = db;
        this.error = error;
    }
    
    async check(): Promise<boolean>{
        const init = await this.db.checkTable("posts");
        if(init === 0){
            const query = `CREATE TABLE posts (id CHAR(50) NOT NULL PRIMARY KEY, userID CHAR(50) NOT NULL, title CHAR(50) NOT NULL, message TEXT NOT NULL, media CHAR(50), created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`;

            return await this.db.createTable(query);
        }
        return init == 1;
    }
    
    async check_posts(userID: string, title: string): Promise<boolean | undefined>{
        const init = await this.db.process("SELECT * FROM posts WHERE userID = ? AND title = ?", [userID, title], "unable to check posts");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }

    async write(response: Response, id: string, title: string, message: string, categories: string[]): Promise<Response<any, Record<string, any>> | undefined>{
        const userID = await new Session(this.db, this.error).get(id);
        const postID = uuid();
        if(userID && await this.check()){
            if(await this.check_posts(userID, title)){
                return response.status(500).send({ messae: "post title already exist for user try updating"});
            }else{
                let userID = uuid();
                const init = await this.db.process("INSERT INTO posts SET id = ?, userID = ?, title = ?, message = ?", [postID, userID, title, message ], "post not created");
                if(init){
                    let success = await new Categories(postID, this.db, this.error).write(categories);
                    if(success){
                        return response.status(201).send({ message: "post created" });
                    }
                }
            }
        }
    }

    async get(response: Response, userID: string): Promise<Response<any, Record<string, any>> | undefined>{
        if(await this.check()){
            const init = await this.db.process("SELECT * FROM kyc WHERE userID = ?", [userID], "unable to fetch kyc details");
            if(init){
                const rows = init as mysql.RowDataPacket[];
                if(rows && rows.length > 0){
                    const result = rows[0];
                    
                    return response.status(200).send({ bank_name: result.bank_name, bank_account: result.bank_account, bank_account_name: result.bank_account_name, bvn: result.bvn});
                }else{
                    return response.status(404).send({ messae: "kyc details not found" });
                }
            }
        }
        return undefined;
    }
}

export const postsRouter = express.Router();

postsRouter.post("/create", (req, res) =>{
    if(req.cookies.blog && req.body.title && req.body.message && req.body.categories){
        const error = new ErrorHandler();
        const database = new Database(error);

        new Post(database, error).write(res, req.cookies.blog, req.body.title, req.body.message, req.body.categories).then((init) =>{
            if(init === undefined || error.has_error()){
                return error.display(res);
            }
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});