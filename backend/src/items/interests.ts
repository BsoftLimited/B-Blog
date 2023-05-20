import express, { Response } from "express";
import mysql from "mysql2";
import Session from "../config/session";
import { Categories, CategoryDetails } from "./posts";
import db from "../config/database";

export class Interest {
    async check(userID: string, categoryID: string): Promise<boolean | undefined>{
        const init = await db.process(`SELECT * FROM Interests WHERE userID = ? categoryID = ?`, [userID, categoryID], "interest checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }

    async all(userID: string): Promise<CategoryDetails[] |undefined>{
        const init = await db.process(`SELECT * FROM Interests WHERE userID = ?`, [userID], "interest checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];

            let categories = new Categories();
            let interests: CategoryDetails[] = [];
            for(let i = 0; i < rows.length; i++){
                const row = rows[i];
                let interest = await categories.get(row.categoryID);
                if(interest){
                    interests.push(interest);
                }else{
                    return undefined;
                }
            }
            return interests;
        }
        return undefined;
    }

    async add(userID: string, categoryID: string): Promise<boolean | undefined>{
        if(await this.check(userID, categoryID)){
            return true;
        }else{
            const init = await db.process(`INSERT INTO Interests SET userID = ?, categoryID = ?`, [userID, categoryID], "interest addition failed");
            if(init){
                return true;
            }
        }
        return undefined;
    }

    async write(response: Response, sessionID: string, interests: string[]): Promise<Response<any, Record<string, any>>>{
        let userID = await new Session().get(sessionID);
        if(userID){
            let categories = new Categories();
            for(let i = 0; i < interests.length; i++){
                let interest = interests[i];
                const categoryID = await categories.add(interest);
                if(typeof categoryID === "number"){
                    if(await this.add(userID, categoryID.toString()) === undefined){
                        return db.errorHandler.display(response);
                    }
                }else{
                    return db.errorHandler.display(response);
                }
            }
            return response.status(200).send({ messeage: "succeeded" });
        }
        return db.errorHandler.display(response);
    }

    async delete(response: Response, id: string, categoryID: string): Promise<Response<any, Record<string, any>>>{
        let userID = await new Session().get(id);
        if(userID){
            if(await this.check(userID, categoryID)){
                const init = await db.process(`DELETE FROM Interests WHERE userID = ? AND categoryID`, [userID, categoryID], "interests delete failed");
                if(init){
                    return response.status(200).send({ messeage: "succeeded", userID: id });
                }
            }else{
                return response.status(500).send({ message: "interests does not exists" });
            }
        }
        return db.errorHandler.display(response);
    }

    async getAll(response: Response, sessionID: string): Promise<Response<any, Record<string, any>>>{
        let userID = await new Session().get(sessionID);
        if(userID){
            const init = await this.all(userID);
            if(init){
                return response.status(200).send(init);
            }
        }
        return db.errorHandler.display(response);
    }
}

export const interestRouter = express.Router();

interestRouter.get("/", (req, res) =>{
    if(req.cookies.blog){
        new Interest().getAll(res, req.cookies.blog).then((init) =>{
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid or expired session"});
    }
});

interestRouter.post("/", (req, res) =>{
    if(req.cookies.blog && req.body.interests){
        new Interest().write(res, req.cookies.blog, req.body.interests).then((init) =>{
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});