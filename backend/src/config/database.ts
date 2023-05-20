import mysql, { RowDataPacket } from "mysql2";
import ErrorHandler from "./error";

export class Database {
    private db: mysql.Connection;
    private error: ErrorHandler;

    constructor(error: ErrorHandler){
        this.db = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PWD,
            database: process.env.DB_NAME
        });

        this.db.connect(async (error)=>{
            if(error){
                console.log(error); 
            }else{
                await this.checkAndCreateTablesIfNotExists();
            }
        });
        this.error = error;
    }

    
    public get errorHandler() : ErrorHandler {
        return this.errorHandler;
    }
    

    private async createTable(query: string): Promise<boolean>{
        return await new Promise<boolean>((resolve, reject) =>{
            this.db.query( query, (error, result) => {
                if (error) {
                    this.error.add(500, JSON.stringify(error), "server encountered error while creating table");
                    reject(error);
                }else{
                    resolve(true);
                }
            });
        });
    }
    
    async process(query: string, params?: any[], errorMessage?: string) : Promise<undefined | mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader>{
        return await new Promise<any>((resolve, reject) =>{
            this.db.query( query, params, (error, result) => {
                if (error) {
                  this.error.add(500, JSON.stringify(error), errorMessage ?? "server error");
                  resolve(undefined);
                };
                resolve(result);
            });
        });  
    }
    
    async checkAndCreateTablesIfNotExists() {
        try {
            await this.createTable(`CREATE TABLE IF NOT EXISTS Users (
                id CHAR(50) NOT NULL PRIMARY KEY,
                name VARCHAR(30) NOT NULL, 
                surname VARCHAR(30) NOT NULL, 
                email VARCHAR(50) NOT NULL, 
                password CHAR(50) NOT NULL
            );`);

            await this.createTable(`CREATE TABLE IF NOT EXISTS Sessions (
                id CHAR(50) PRIMARY KEY NOT NULL,
                userID CHAR(50) NOT NULL);`);

            await this.createTable(`CREATE TABLE IF NOT EXISTS Categories (
                id INT NOT NULL AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                slurg VARCHAR(255) NOT NULL,
                PRIMARY KEY (id)
            );`);

            await this.createTable(`CREATE TABLE IF NOT EXISTS Interests (
                userID CHAR(50) NOT NULL,
                categoryID INT NOT NULL,
                PRIMARY KEY (userID, categoryID),
                FOREIGN KEY (userID) REFERENCES Users(id),
                FOREIGN KEY (categoryID) REFERENCES Categories(id)
            );`);

            await this.createTable(`CREATE TABLE IF NOT EXISTS Posts (
                id CHAR(50) NOT NULL PRIMARY KEY,
                userID CHAR(50) NOT NULL, 
                title VARCHAR(50) NOT NULL, 
                message TEXT NOT NULL, 
                created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userID) REFERENCES Users(id)
            );`);

            await this.createTable(`CREATE TABLE IF NOT EXISTS PostCategories (
                postID CHAR(50) NOT NULL, 
                categoryID INT NOT NULL,
                PRIMARY KEY (postID, categoryID),
                FOREIGN KEY (postID) REFERENCES Posts(id),
                FOREIGN KEY (categoryID) REFERENCES Categories(id)
            );`);

            await this.createTable(`CREATE TABLE IF NOT EXISTS PostLikes (
                userID CHAR(50) NOT NULL,
                postID CHAR(50) NOT NULL,
                likes BOOLEAN NOT NULL,
                PRIMARY KEY (userID, postID),
                FOREIGN KEY (userID) REFERENCES Users(id),
                FOREIGN KEY (postID) REFERENCES Posts(id)
            );`);

            await this.createTable(`CREATE TABLE IF NOT EXISTS Comments (
                id CHAR(50) NOT NULL PRIMARY KEY,
                postID CHAR(50) NOT NULL,
                userID CHAR(30) NOT NULL, 
                message CHAR(30) NOT NULL,
                time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userID) REFERENCES Users(id),
                FOREIGN KEY (postID) REFERENCES Posts(id)
            );`);

            await this.createTable(`CREATE TABLE IF NOT EXISTS CommentsLikes (
                userID CHAR(50) NOT NULL,
                commentID CHAR(50) NOT NULL, 
                likes BOOLEAN NOT NULL,
                PRIMARY KEY (userID, commentID),
                FOREIGN KEY (userID) REFERENCES Users(id),
                FOREIGN KEY (commentID) REFERENCES Comments(id)
            );`);

            await this.createTable(`CREATE TABLE IF NOT EXISTS Following (
                userID CHAR(50) NOT NULL,
                followerID CHAR(50) NOT NULL,
                PRIMARY KEY (userID, followerID),
                FOREIGN KEY (userID) REFERENCES Users(id),
                FOREIGN KEY (followerID) REFERENCES Users(id)
            );`);

            await this.createTable(`CREATE TABLE IF NOT EXISTS Views (
                userID CHAR(50) NOT NULL, 
                postID CHAR(50) NOT NULL, 
                time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (userID, postID),
                FOREIGN KEY (userID) REFERENCES Users(id),
                FOREIGN KEY (postID) REFERENCES Posts(id)
            );`);

        } catch (error) {
            console.error(error);
        }
    }
}

const db = new Database(new ErrorHandler());

export default db;