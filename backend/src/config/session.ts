import Database from "./database";
import ErrorHandler from "./error";
import mysql from "mysql2";
import uuid from "../utils";

export default class Session{
    
    public db: Database;
    private error: ErrorHandler;
		
	constructor(db: Database, error: ErrorHandler){
		this.db = db;
        this.error = error;	
	}
		
	private async check(){
        const init = await this.db.checkTable("sessions");
        if(init == 0){
            return this.db.createTable("CREATE TABLE sessions (id CHAR(50) PRIMARY KEY NOT NULL, userID CHAR(50) NOT NULL, time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)");
        }
        return init == 1;
    }

    private async check_users(userID: string): Promise<boolean | undefined>{
        const init = await this.db.process("SELECT * FROM sessions WHERE userID = ?", [userID], "session error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            if(rows.length > 0){
                const result = rows[0];
                if(this.isExpired(result.time) && await this.delete(userID)){
                    return false;
                }else{
                    return true;
                }
            }
        }
        return undefined;
    }
		
    private isExpired(time: string): boolean{
        const init = new Date(Date.now().valueOf() - new Date(time).valueOf());
        
        const year =  init.getFullYear() * 12 * 30 * 24;
        const month = init.getMonth() * 30 * 24;
        const day =  init.getDate() * 24;
        const hour = init.getHours();
        
        const total = year + month + day + hour;
        return total > 2;
    }

    async refresh(userID: string): Promise<boolean>{
        if(await this.check()){
            const stmt = "UPDATE sessions SET time = CURRENT_TIMESTAMP WHERE userID = ?";
            const init = await this.db.process(stmt, [userID], "unable to update session");
            if(init){
                return true;   
            }
        }
        return false;
    }
		
    async get(id: string): Promise<string | undefined>{
        if(await this.check()){	
            const init = await this.db.process("SELECT userID, time FROM sessions WHERE id = ?", [id], "sessions error");
            if(init){
                const rows = (init as mysql.RowDataPacket[]);
                if(rows && rows.length > 0){
                    return rows[0].userID;
                }
            }else{
                this.error.add(404, "", "session not found or expired");
            }
        }
        return undefined;
    }
		
	async create(userID: string): Promise<string | undefined>{
        const token = uuid();
		if(await this.check()){
            const check_result = await this.check_users(userID);
            if(check_result && await this.delete(userID)){
                return await this.create(userID);
            }else{
                const init = await this.db.process("INSERT INTO sessions SET id = ?, userID = ?", [token, userID], "unable to create session");
                if(init){
                    return token;
                }
            }
		}
        return undefined;
    }
		
	async delete(userID: string): Promise<boolean>{
        if(await this.check()){
            const init = await this.db.process("DELETE from sessions WHERE userID = ?", [userID], "unable to delete previous session");
            if(init){
                return true;
            }
        }
        return false;
	}
}