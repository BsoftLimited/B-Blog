import express, { Response, Request } from "express";
import mysql from "mysql2";
import Session from "../config/session";
import uuid from "../utils";
import db from "../config/database";

export interface UserDetails{
    name: string, surname: string, email: string, 
}

export class User {    
    async check_users(email: string): Promise<boolean | undefined>{
        const init = await db.process("SELECT * FROM Users WHERE email = ?", [email], "user checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }

    async details(userID: string): Promise<UserDetails | undefined>{
        const init = await db.process("SELECT * FROM Users WHERE id = ?", [userID], "user checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return  { name: rows[0].name, surname: rows[0].surname, email: rows[0].email };
        }
        return undefined;
    }

    async write(request: Request, response: Response, name: string, surname: string, email: string, password: string): Promise<Response<any, Record<string, any>>>{
        let userID = uuid();
        if(await this.check_users(email)){
            return response.status(500).send({ message: "user with the same email already exists"});
        }else{
            const init = await db.process("INSERT INTO Users SET id = ?, name = ?, surname = ?, email = ?, password = ?", [userID, name, surname, email, password], "user registration failed");
            if(init){
                const session = new Session();
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
        return db.errorHandler.display(response);
    }


    async login(request: Request, response: Response, email: string, password: string): Promise<Response<any, Record<string, any>>>{
        const init = await db.process("SELECT * FROM Users WHERE email = ?", [email], "email or user does not exits");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            if(rows && rows.length > 0){
                const result = rows[0];
                if(result.password === password){
                    const session = new Session();
                    const id = await session.create(result.id);
                    if(id){
                        response.cookie('blog', id, {
                            expires: new Date(
                                Date.now() + Number.parseInt(process.env.JWT_COOKIE_EXPIRES_IN as string) * 24 * 60 * 60 * 1000
                            ),
                            httpOnly: true,
                            secure: request.secure || request.headers['x-forwarded-proto'] === 'https',
                        });
                        return response.status(200).send({ id: id, name: result.name, surname: result.surname, email: email});
                    }
                }else {
                    return response.status(400).send({ messae: "incorrect password, please try again" });
                }
            }else if(rows && rows.length === 0){
                return response.status(404).send({ messae: "account with this email address not found" });
            }
        }
        return db.errorHandler.display(response);
    }

    async init(response: Response, id: string): Promise<Response<any, Record<string, any>>>{
        const session = new Session();
        const userID = await session.get(id);
        if(userID){
            const init = await db.process("SELECT * FROM Users WHERE id = ?", [userID], "fetching user error");
            if(init){
                const rows = init as mysql.RowDataPacket[];
                if(rows){
                    if(rows.length > 0){
                        const result = rows[0];
                        return response.status(200).send({ id: id, name: result.name, surname: result.surname, email: result.email, phone: result.phone });
                    }else{
                        return response.status(404).send({ messae: "account with this email address not found" });
                    }
                }
            }
        }
        return db.errorHandler.display(response);
    }
}

export const userRouter = express.Router();

userRouter.post("/", (req, res) =>{
    if(req.body.name && req.body.surname && req.body.email && req.body.password){
        new User().write(req, res, req.body.name, req.body.surname, req.body.email, req.body.password).then((init) =>{
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});

userRouter.get("/", (req, res) =>{
    if(req.cookies.blog){
        new User().init(res, req.cookies.blog).then((init) =>{
            return init;
        });
    }else{
        return res.status(500).send({message: "cookie expired, try login in again"});
    }
});

userRouter.post("/login", (req, res) =>{
    if(req.body.email && req.body.password){
        new User().login(req, res, req.body.email, req.body.password).then((init) =>{
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});

userRouter.get("/logout", (req, res) =>{
    if(req.cookies.blog){
        res.cookie('blog', '', {
            expires: new Date(Date.now() + 10 * 300),
            httpOnly: true,
          });
          res.status(200).json({ status: 'success' });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});