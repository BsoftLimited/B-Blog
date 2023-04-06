import mysql, { RowDataPacket } from "mysql2";
import ErrorHandler from "./error";

export default class Database {
    private db: mysql.Connection;
    private error: ErrorHandler;

    constructor(error: ErrorHandler){
        this.db = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PWD,
            database: process.env.DB_NAME
        });

        this.db.connect((error)=>{ console.log(error); });
        this.error = error;
    }

    async checkTable(name: string): Promise<number>{
        const query = "SELECT * FROM information_schema.tables WHERE table_schema = ? AND table_name = ?";

        let init = await new Promise<number>((resolve, reject) =>{
            this.db.query( query, [process.env.DB_NAME, name], (error, result) => {
                if (error) {
                    this.error.add(500, JSON.stringify(error), "server error");
                    reject(error);
                }else{
		            const rows = (<RowDataPacket[]> result);
		            resolve(rows.length);
                }
            });
        });

        return init;
    }
    
    async createTable(query: string): Promise<boolean>{
        return await new Promise<boolean>((resolve, reject) =>{
            this.db.query( query, (error, result) => {
                if (error) {
                    this.error.add(500, JSON.stringify(error), "server error");
                    reject(error);
                }else{
                    resolve(true);
                }
            });
        });
    }
    
    async process(query: string, params: any[], errorMessage: string) : Promise<any>{
        return await new Promise<any>((resolve, reject) =>{
            this.db.query( query, params, (error, result) => {
                if (error) {
                  this.error.add(500, JSON.stringify(error), errorMessage);
                  reject(error);
                };
                resolve(result);
            });
        });  
    }
}