import Database from "../config/database";
import ErrorHandler from "../config/error";
import mysql, { RowDataPacket } from "mysql2";
import express, { Response } from "express";
import Session from "../config/session";
import uuid, { toSlurg } from "../utils";
import { CommentDetails, Comments } from "./comments";
import { PostLikes, CommentLikes } from "./likes";
import { User, UserDetails } from "./user";
import { Interest } from "./interests";
import { Views } from "./views";

export interface CategoryDetails{
    id: string, name: string, slurg: string
}

export interface PostDetails{ 
    id: string, title: string, message: string, owner: UserDetails, created: string,
    comments: number, categories: CategoryDetails[], views: number,
    likes:{
        likes: number, dislikes: number, doI?: boolean }
}

export interface SinglePostDetails{ 
    id: string, title: string, message: string, owner: UserDetails, created: string,
    comments: CommentDetails[], categories: CategoryDetails[], views: UserDetails[],
    likes:{
        likes: UserDetails[], dislikes: UserDetails[], doI?: boolean }
}

export class Categories {
    db: Database;
    error: ErrorHandler;

    constructor(db: Database, error: ErrorHandler){
        this.db = db;
        this.error = error;
    }
    
    async check_categories(slurg: string): Promise<number | undefined>{
        const init = await this.db.process(`SELECT id FROM Categories WHERE slurg = ?`, [slurg], "post categories checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            if(rows.length >  0){
                return rows[0].id;
            }else{
                return -1;
            }
        }
        return undefined;
    }

    async add(name: string): Promise<number | undefined>{
        const slurg = toSlurg(name);
        const initID = await this.check_categories(slurg);
        if(initID === -1){
            const result =  await this.db.process(`INSERT INTO Categories SET name = ?, slurg = ?`, [name, slurg], `post category ${name} addition failed`) as mysql.ResultSetHeader;
            if(result && result.insertId){
                return result.insertId;
            }
        }else if(typeof initID === "number"){
            return initID;
        }
        return undefined;
    }

    async get(id: string): Promise<CategoryDetails | undefined>{
        const result =  await this.db.process(`SELECT * FROM Categories WHERE id = ?`, [id], `category selection failed`);
        if(result){
            const rows = result as RowDataPacket[];
            return { name: rows[0].name, id: id, slurg: rows[0].slurg };
        }
        return undefined;
    }

    async all(): Promise<CategoryDetails[] | undefined>{
        const init = await this.db.process(`SELECT * FROM Categories`, [], "unable to fetch post categories");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            if(rows.length > 0){
                return rows.map<CategoryDetails>(row =>{ return { name: row.name, id: row.id, slurg: row.slurg }; } );
            }else{
                return [];
            }
        }
        return undefined;
    }

    async delete(id: string): Promise<boolean |  undefined>{
        const init = await this.db.process(`DELETE FROM Categories WHERE id = ?`, [id], `category deletion failed`);
        if(init){
            return true;
        }
        return undefined;
    }

    async getAll(response: Response): Promise<Response<any, Record<string, any>>>{
        let init = await this.all();
        if(init){
            return response.status(200).send(init);
        }
        return this.error.display(response);
    }
}

export class PostCategories{
    db: Database;
    error: ErrorHandler;

    constructor(db: Database, error: ErrorHandler){
        this.db = db;
        this.error = error;
    }

    async check_categories(postID: string, categoryID: string): Promise<boolean | undefined>{
        const init = await this.db.process(`SELECT * FROM PostCategories WHERE postID = ? AND categoryID = ?`, [postID, categoryID], "postCategories checking error");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }

    async add(postID: string, category: string): Promise<boolean | undefined>{
        const categoryID = await new Categories(this.db, this.error).add(category);
        if(categoryID){
            const check = await this.check_categories(postID, categoryID.toString());
            if(check === false){
                const result =  await this.db.process(`INSERT INTO PostCategories SET postID = ?, categoryID = ?`, [postID, categoryID], `postCategory addition failed`) as mysql.ResultSetHeader;
                if(result){
                    return true;
                }
            }else if(check === true){
                return true;
            }
        }
        return undefined;
    }

    async get(postID: string): Promise<CategoryDetails[] | undefined>{
        const result =  await this.db.process(`SELECT * FROM PostCategories WHERE postID = ?`, [postID], `post categories selection failed`);
        if(result){
            const rows = result as RowDataPacket[];
            const categories = new Categories(this.db, this.error);

            let init: CategoryDetails[] = [];
            for(let i = 0; i < rows.length; i++){
                let category = await categories.get(rows[i].categoryID);
                if(category){
                    init.push(category);
                }else{
                    return  undefined;
                }
            }
            return init;
        }
        return undefined;
    }

    async delete(postID: string, categoryID: string): Promise<boolean | undefined>{
        const init = await this.db.process(`DELETE FROM PostCategories WHERE postID = ? AND categoryID = ?`, [postID, categoryID], `postCategory deletion failed`);
        if(init){
            return true;
        }
        return undefined;
    }

    async posts(response: Response, category: string): Promise<Response<any, Record<string, any>>>{
        const init = await this.db.process(`SELECT Posts.id FROM Posts
                INNER JOIN PostCategories ON Posts.id = PostCategories.postID
                INNER JOIN Categories ON PostCategories.categoryID = Categories.id
                WHERE Categories.slurg = ? ORDER BY Posts.created DESC LIMIT 24;`, [category], "unable to fetch category posts");
        if(init){
            const rows = init as RowDataPacket[];
            let posts: PostDetails[] = [];
            const postInstance = new Post(this.db, this.error);
            for(let i = 0; i < rows.length; i++){
                let postID = rows[i].id;
                let post = await postInstance.get(postID);
                if(post){
                    posts.push(post);
                }else{
                    return this.error.display(response);
                }
            }

            const latest = await postInstance.latest();
            if(latest){
                return response.status(200).send({posts: posts, latest: latest });
            }
        }
        return this.error.display(response);
    }
}

export default class Post {
    db: Database;
    error: ErrorHandler;

    constructor(db: Database, error: ErrorHandler){
        this.db = db;
        this.error = error;
    }
    
    async check_posts(userID: string, title: string): Promise<boolean | undefined>{
        const init = await this.db.process("SELECT * FROM Posts WHERE userID = ? AND title = ?", [userID, title], "unable to check posts");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            return rows.length > 0;
        }
        return undefined;
    }

    async write(response: Response, id: string, title: string, message: string, categories: string[]): Promise<Response<any, Record<string, any>>>{
        const userID = await new Session(this.db, this.error).get(id);
        const postID = uuid();
        if(userID){
            if(await this.check_posts(userID, title)){
                return response.status(500).send({ messae: "post title already exist for user try updating"});
            }else{
                const init = await this.db.process("INSERT INTO Posts SET id = ?, userID = ?, title = ?, message = ?", [postID, userID, title, message ], "post not created");
                if(init){
                    for(let index = 0; index < categories.length; index++){
                        let category = categories[index];
                        let success = await new PostCategories(this.db, this.error).add(postID, category);
                        if(success === undefined && this.error.has_error()){
                            return this.error.display(response);
                        }
                    }
                    return response.status(201).send({ message: "post created" });
                }
            }
        }
        return this.error.display(response);
    }

    async get(id: string, userID?: string): Promise<PostDetails | undefined>{
        const init = await this.db.process("SELECT * FROM Posts WHERE id = ?", [id], "unable to fetch post details");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            if(rows && rows.length > 0){
                const result = rows[0];
                let comments = await new Comments(this.db, this.error).count(result.id);
                let categories = await new PostCategories(this.db, this.error).get(result.id);
                let user = await new User(this.db, this.error).details(result.userID);

                let likesInstance = new PostLikes(this.db, this.error, result.id);
                let likes = await likesInstance.likes_count();
                let dislikes = await likesInstance.dislikes_count();
                let doI = userID ? await likesInstance.doI(userID) : undefined;

                let viewsInstance = new Views(this.db, this.error);
                let viewCount = await viewsInstance.count(result.id);
                
                if(categories !== undefined && user !== undefined && likes !== undefined && dislikes !== undefined && comments !== undefined && categories !== undefined && viewCount !== undefined){
                    return { 
                        id: id, title: result.title, message: result.message, created: result.created, owner: user!,
                        comments : comments!, categories: categories!, views: viewCount!,
                        likes:{ likes: likes!, dislikes: dislikes!, doI : doI }
                    }    
                }
            }else{
                this.error.add(404, `post with id: ${id} not found`, "post not found");
            }
        }
        return undefined;
    }

    async latest(): Promise<PostDetails[] | undefined>{
        const init = await this.db.process("SELECT id FROM Posts ORDER BY created DESC LIMIT 10;", [], "unable to fetch latest post details");
        if(init){
            let rows = init as RowDataPacket[];

            let posts: PostDetails[] = [];
            for(let i = 0; i < rows.length; i++){
                let row = rows[i];
                let post = await this.get(row.id);
                if(post){
                    posts.push(post);
                }else{
                    return undefined;
                }
            }
            return posts;
        }
        return undefined;
    }

    async one(response: Response, id: string, userID?: string): Promise<Response<any, Record<string, any>>>{
        const init = await this.db.process("SELECT * FROM Posts WHERE id = ?", [id], "unable to fetch post details");
        if(init){
            const rows = init as mysql.RowDataPacket[];
            if(rows && rows.length > 0){
                const result = rows[0];
                let comments = await new Comments(this.db, this.error).all(result.id);
                let categories = await new PostCategories(this.db, this.error).get(result.id);
                let user = await new User(this.db, this.error).details(result.userID);

                let likesInstance = new PostLikes(this.db, this.error, result.id);
                let likes = await likesInstance.likes();
                let dislikes = await likesInstance.dislikes();
                let doI = userID ? await likesInstance.doI(userID) :  undefined;

                let viewsInstance = new Views(this.db, this.error);
                let viewCount = await viewsInstance.all(result.id);

                const similarQuery = await this.db.process(`SELECT p.id FROM Posts p
                    INNER JOIN PostCategories cp ON p.id = cp.postID
                    INNER JOIN ( SELECT categoryID FROM PostCategories WHERE postID = ?) cp2 ON cp.categoryID = cp2.categoryID
                    WHERE p.id != ? ORDER BY p.created DESC LIMIT 10;`, [id, id], "unable to fetch similar post as the viewing");

                let similars: PostDetails[] = [];
                if(similarQuery){
                    let similarResults = similarQuery as RowDataPacket[];
                    for(let i = 0; i < similarResults.length; i++){
                        const similarResult = similarResults[i];
                        const similar = await this.get(similarResult.id);
                        if(similar){
                            similars.push(similar);
                        }else{
                            return this.error.display(response);   
                        }
                    }
                }else{
                    return this.error.display(response);
                }

                const latest = await this.latest();
                
                if(categories !== undefined && user !== undefined && likes !== undefined && dislikes !== undefined && comments !== undefined && categories !== undefined && viewCount !== undefined && latest !== undefined){
                    return response.status(200).send({ 
                        main: { id: id, title: result.title, message: result.message, created: result.created, owner: user!,
                        comments : comments!, categories: categories!, views: viewCount!,
                        likes: likes!, dislikes: dislikes!, doI : doI},  similar: similars, latest: latest });
                }
            }else{
                this.error.add(404, `post with id: ${id} not found`, "post not found");
            }
        }
        return this.error.display(response);   
    }

    async init(response: Response, sessionID?: string): Promise<Response<any, Record<string, any>>>{
        let  userID: string | undefined;
        if(sessionID){
            let init = await new Session(this.db, this.error).get(sessionID);
            if(init){
                userID = init;
            }
        }

        let query = `SELECT Posts.id FROM Posts
            INNER JOIN PostCategories ON Posts.id = PostCategories.postID
            INNER JOIN Categories ON PostCategories.categoryID = Categories.id
            INNER JOIN ( SELECT id FROM Posts ORDER BY created DESC LIMIT 25) latest_posts ON Posts.id = latest_posts.id 
        GROUP BY Posts.id HAVING COUNT(*) >= 1 ORDER BY Posts.created DESC LIMIT 25;`;

        if (userID) {
            query = `SELECT Posts.id FROM Posts
                INNER JOIN PostCategories ON Posts.id = PostCategories.postID
                INNER JOIN Categories ON PostCategories.categoryID = Categories.id
                INNER JOIN ( SELECT id FROM Posts ORDER BY created DESC LIMIT 25) latest_posts ON Posts.id = latest_posts.id
                INNER JOIN Interests ON Categories.id = Interests.categoryID
            WHERE Interests.userID = ? GROUP BY Posts.id HAVING COUNT(*) >= 1 ORDER BY Posts.created DESC LIMIT 25;`;
        }

        const init = await this.db.process(query, [userID], "unable to fetch posts");

        if(init){
            const rows = init as mysql.RowDataPacket[];
            let posts: PostDetails[] = [];
            for(let i = 0; i < rows.length; i++){
                let post = await this.get(rows[i].id, userID === "" ? undefined : userID);
                if(post){
                    posts.push(post);
                }else{
                    return this.error.display(response);
                }
            }

            const latest = await this.latest();
            if(latest){
                return response.status(200).send({recommendations: posts, latest: latest });
            }
        }
        return this.error.display(response);
    }
}

export const postsRouter = express.Router();

postsRouter.post("/", (req, res) =>{
    if(req.cookies.blog && req.body.title && req.body.message && req.body.categories){
        const error = new ErrorHandler();
        const database = new Database(error);

        new Post(database, error).write(res, req.cookies.blog, req.body.title, req.body.message, req.body.categories).then((init) =>{
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});

postsRouter.get("/", (req, res) =>{
    const error = new ErrorHandler();
    const database = new Database(error);

    new Post(database, error).init(res, req.cookies.blog).then((init) =>{
        return init;
    });
});

postsRouter.get("/categories", (req, res) =>{
    const error = new ErrorHandler();
    const database = new Database(error);

    new Categories(database, error).getAll(res).then((init) =>{
        return init;
    });
});

postsRouter.get("/categories/:slurg", (req, res) =>{
    const error = new ErrorHandler();
    const database = new Database(error);

    if(req.params.slurg){
        new PostCategories(database, error).posts(res, req.params.slurg).then((init) =>{
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});

postsRouter.get("/:id", (req, res) =>{
    if(req.params.id){
        const error = new ErrorHandler();
        const database = new Database(error);

        new Post(database, error).one(res, req.params.id, req.cookies.blog).then((init) =>{
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});

postsRouter.get("/:id/comments", (req, res) =>{
    const errorHandler = new ErrorHandler();
    const database = new Database(errorHandler);

    new Comments(database, errorHandler).getAll(res, req.params.id).then((init) =>{
        return init;
    });
});

postsRouter.get("/:id/views", (req, res) =>{
    if(req.cookies.blog){
        const errorHandler = new ErrorHandler();
        const database = new Database(errorHandler);

        new Views(database, errorHandler).getAll(res, req.params.id).then((init) =>{
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});

postsRouter.get("/:id/like", (req, res) =>{
    if(req.cookies.blog){
        const errorHandler = new ErrorHandler();
        const database = new Database(errorHandler);

        new PostLikes(database, errorHandler, req.params.id).like(res, req.cookies.blog).then((init) =>{
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});

postsRouter.get("/:id/dislike", (req, res) =>{
    if(req.cookies.blog){
        const errorHandler = new ErrorHandler();
        const database = new Database(errorHandler);

        new PostLikes(database, errorHandler, req.params.id).dislike(res, req.cookies.blog).then((init) =>{
            return init;
        });
    }else{
        return res.status(500).send({message: "invalid request to server"});
    }
});