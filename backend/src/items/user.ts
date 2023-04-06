import express, { Response, Request } from "express";
import mysql from "mysql2";
import Database from "../config/database";
import ErrorHandler from "../config/error";
import Session from "../config/session";
import uuid from "../utils";

export interface UserDatails{
    name: string, surname: string, email: string, 
}

export class User {
    db: Database;
    error: ErrorHandler;

    constructor(db: Database, error: ErrorHandler){
        this.db = db;
        this.error = error;
    }
    
    async check(): Promise<boolean>{
        const init = await this.db.checkTable("users");
        if(init === 0){
            return this.db.createTable(`CREATE TABLE users (id CHAR(50) NOT NULL PRIMARY KEY, name CHAR(30) NOT NULL, surname CHAR(30) NOT NULL, email CHAR(50) NOT NULL, password CHAR(20) NOT NULL)`);
        }
        return init == 1;
    }
    
    async check_users(email: string): Promise<boolean | undefined>{
        const init = await this.db.process("SELECT * FROM users WHERE email = ?", [email], "user checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }

    async details(userID: string): Promise<UserDatails | undefined>{
        const init = await this.db.process("SELECT * FROM users WHERE userID = ?", [userID], "user checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return  { name: rows[0].name, surname: rows[0].surname, email: rows[0].email };
        }
        return undefined;
    }

    async write(request: Request, response: Response, name: string, surname: string, email: string, password: string): Promise<Response<any, Record<string, any>> | undefined>{
        let userID = uuid();
        try{
            if(await this.check()){
                if(await this.check_users(email)){
                    return response.status(500).send({ message: "user with the same email already exists"});
                }else{
                    const init = await this.db.process("INSERT INTO users SET id = ?, name = ?, surname = ?, email = ?, password = ?", [userID, name, surname, email, password], "user registration failed");
                    if(init){
                        const session = new Session(this.db, this.error);
                        const id = await session.create(userID);
                        if(id){
                            response.cookie('blog', id, {
                                expires: new Date(
                                  Date.now() + Number.parseInt(process.env.JWT_COOKIE_EXPIRES_IN as string) * 24 * 60 * 60 * 1000
                                ),
                                httpOnly: true,
                                secure: request.secure || request.headers['x-forwarded-proto'] === 'https',
                            });
                            return response.status(201).send({ id: id, name: name, suname: surname, email: email});
                        }else{
                            return response.status(500).send({ message: "session creation failed, but registrated succesfully, try login in" });
                        }
                    }
                }
            }
        }catch(error){
            console.log(error);
        }
        return response.status(500).send({ message: "unknown server errror" });
    }


    async login(request: Request, response: Response, email: string, password: string): Promise<Response<any, Record<string, any>> | undefined>{
        if(await this.check()){
            const init = await this.db.process("SELECT * FROM users WHERE email = ?", [email], "email or user does not exits");
            if(init){
                const rows = init as mysql.RowDataPacket[];
                if(rows && rows.length > 0){
                    const result = rows[0];
                    if(result.password === password){
                        const session = new Session(this.db, this.error);
                        const id = await session.create(result.id);
                        if(id){
                            response.cookie('blog', id, {
                                expires: new Date(
                                  Date.now() + Number.parseInt(process.env.JWT_COOKIE_EXPIRES_IN as string) * 24 * 60 * 60 * 1000
                                ),
                                httpOnly: true,
                                secure: request.secure || request.headers['x-forwarded-proto'] === 'https',
                            });
                            return response.status(200).send({ id: id, name: result.name, surname: result.surname, email: email, phone: result.phone});
                        }
                    }else{
                        return response.status(400).send({ messae: "incorrect password, please try again" });
                    }
                }else{
                    return response.status(404).send({ messae: "account with this email address not found" });
                }
            }
        }
        return undefined;
    }

    async init(response: Response, id: string): Promise<Response<any, Record<string, any>> | undefined>{
        if(await this.check()){
            const session = new Session(this.db, this.error);
            const userID = await session.get(id);
            if(userID){
                const init = await this.db.process("SELECT * FROM users WHERE id = ?", [userID], "fetching user error");
                if(init){
                    const rows = init as mysql.RowDataPacket[];
                    if(rows && rows.length > 0){
                        const result = rows[0];
                        return response.status(201).send({ id: id, name: result.name, surname: result.surname, email: result.email, phone: result.phone });
                    }else{
                        return response.status(404).send({ messae: "account with this email address not found" });
                    }
                }
            }
        }
        return undefined;
    }
}

export const userRouter = express.Router();

userRouter.post("/login", (req, res) =>{
    if(req.body.email && req.body.password){
        const errorHandler = new ErrorHandler();
        const database = new Database(errorHandler);

        new User(database, errorHandler).login(req, res, req.body.email, req.body.password).then((init) =>{
            if(init === undefined || errorHandler.has_error()){
                return errorHandler.display(res);
            }
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});

userRouter.post("/signup", (req, res) =>{
    if(req.body.name && req.body.surname && req.body.email && req.body.password){
        const errorHandler = new ErrorHandler();
        const database = new Database(errorHandler);

        new User(database, errorHandler).write(req, res, req.body.name, req.body.surname, req.body.email, req.body.password).then((init) =>{
            if(init === undefined || errorHandler.has_error()){
                return errorHandler.display(res);
            }
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});

userRouter.get("/", (req, res) =>{
    if(req.cookies.blog){
        const errorHandler = new ErrorHandler();
        const database = new Database(errorHandler);

        new User(database, errorHandler).init(res, req.cookies.blog).then((init) =>{
            if(init === undefined || errorHandler.has_error()){
                return errorHandler.display(res);
            }
            return init;
        });
    }else{
        return res.status(500).send({message: "cookie expired, try login in again"});
    }
});