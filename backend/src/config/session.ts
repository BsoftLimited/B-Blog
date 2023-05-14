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

    private async check_users(userID: string): Promise<boolean | undefined>{
        const init = await this.db.process("SELECT * FROM Sessions WHERE userID = ?", [userID], "session error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }
		
    async get(id: string): Promise<string | undefined>{
        const init = await this.db.process("SELECT userID FROM Sessions WHERE id = ?", [id], "sessions error");
        if(init){
            const rows = (init as mysql.RowDataPacket[]);
            if(rows && rows.length > 0){
                return rows[0].userID;
            }else{
                this.error.add(404, "", "session not found or expired");
            }
        }
        return undefined;
    }
		
	async create(userID: string): Promise<string | undefined>{
        const token = uuid();
        const check_result = await this.check_users(userID);
        if(check_result && await this.delete(userID)){
            return await this.create(userID);
        }else{
            const init = await this.db.process("INSERT INTO Sessions SET id = ?, userID = ?", [token, userID], "unable to create session");
            if(init){
                return token;
            }
        }
        return undefined;
    }
		
	async delete(userID: string): Promise<boolean | undefined>{
        const init = await this.db.process("DELETE from Sessions WHERE userID = ?", [userID], "unable to delete previous session");
        if(init){
            return true;
        }
        return undefined;
	}
}