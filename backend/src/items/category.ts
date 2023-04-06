
import express, { Response } from "express";
import mysql from "mysql2";
import Database from "../config/database";
import ErrorHandler from "../config/error";
import uuid from "../utils";

class Posts {
    db: Database;
    error: ErrorHandler;
    categoryID: string;

    constructor(categoryID: string, db: Database, error: ErrorHandler){
        this.db = db;
        this.error = error;
        this.categoryID = categoryID;
    }
    
    async check(): Promise<boolean>{
        const init = await this.db.checkTable(`${this.categoryID}_posts`);
        if(init === 0){
            return this.db.createTable(`CREATE TABLE ${this.categoryID}_posts (id CHAR(50) NOT NULL PRIMARY KEY)`);
        }
        return init == 1;
    }
    
    async check_posts(id: string): Promise<boolean | undefined>{
        const init = await this.db.process(`SELECT * FROM ${this.categoryID}_posts WHERE id = ?`, [id], "category posts checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }

    async write(postID: string): Promise<boolean | undefined>{
        if(await this.check()){
            try{
                if(await this.check_posts(postID) === false){
                    const init = await this.db.process(`INSERT INTO ${this.categoryID}_posts SET id = ?`, [postID], `category posts addition failed`);
                    return init !== undefined;
                }
            }catch(error){
                this.error.add(500, JSON.stringify(error), "server error");
            }
        }
        return undefined;
    }

    async delete(postID: string): Promise<boolean | undefined>{
        try{
            const init = await this.db.process(`DELETE FROM ${this.categoryID}_posts WHERE id = ?`, [postID], `category posts deletion failed`);
            return init !== undefined;
        }catch(error){
            console.log(error);
            this.error.add(500, JSON.stringify(error), "category posts deletion failed");
        }
        return undefined;
    }
}

export class Category {
    db: Database;
    error: ErrorHandler;

    constructor(db: Database, error: ErrorHandler){
        this.db = db;
        this.error = error;
    }
    
    async check(): Promise<boolean>{
        const init = await this.db.checkTable(`category`);
        if(init === 0){
            return this.db.createTable(`CREATE TABLE category (id CHAR(50) NOT NULL PRIMARY KEY, name CHAR(30) NOT NULL, latest TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
        }
        return init == 1;
    }
    
    async check_category(name: string): Promise<boolean | undefined>{
        const init = await this.db.process(`SELECT * FROM category WHERE name = ?`, [name], "category checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }

    async write(postID: string, names: string[]): Promise<boolean>{
        let ok = true;
        if(await this.check()){
            names.forEach(async (name) =>{
                const categoryID = uuid();
                try{
                    let exits = await this.check_category(name);
                    if(exits === false){
                        if(!(await this.db.process(`INSERT INTO category SET id = ?, name = ?`, [categoryID, name], `category ${name} addition failed`) && 
                        await new Posts(categoryID, this.db, this.error).write(postID))){
                            ok = false;
                        }else{

                        }
                    }else if(exits === true){
                        if(!(await this.db.process(`UPDATE category SET latest = CURRENT_TIMESTAMP WHERE name = ?`, [name], `category ${name} addition failed`) && 
                            await new Posts(categoryID, this.db, this.error).write(postID))){
                            ok = false;
                        }
                    }
                }catch(error){
                    this.error.add(500, JSON.stringify(error), "server error");
                    ok = false;
                }
            });
        }
        return ok;
    }

    async delete(name: string): Promise<boolean>{
        try{
            const init = await this.db.process(`DELETE FROM category WHERE name = ?`, [name], `category ${name} deletion failed`);
            if(init){
                return true;
            }
        }catch(error){
            console.log(error);
            this.error.add(500, JSON.stringify(error), `category ${name} deletion failed`);
        }
        return false;
    }

    async getAll(): Promise<{name: string, latest: string }[] | undefined>{
        if(await this.check()){
            const init = await this.db.process(`SELECT * FROM category`, [], "category checking error");
            if(init){
                const rows = init as mysql.RowDataPacket[];
                return rows.map<{name: string, latest: string }>((row) =>{
                    return { name: row.name, latest: row.latest }
                })
            }
        }
        return undefined;
    }
}

export const categoryRouter = express.Router();