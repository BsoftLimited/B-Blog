import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import express from "express";
import { userRouter } from "./items/user";
import cors from 'cors';
import { interestRouter } from "./items/interests";
import { postsRouter } from "./items/posts";

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());
//app.use(express.json());

app.enable('trust proxy');
app.use(cookieParser());
const whitelist = ["http://localhost:5173"];
const corsOptions = {
    credentials: true,
    origin: function(origin: any, callback: any){
        if(!origin){
            return callback(null, true);
        }else if(whitelist.indexOf(origin) === -1){
            return callback(new Error("not allowed by CORS"), false);
        }
        return callback(null, true);
    }
}
app.use(cors(corsOptions));

app.use("/user", userRouter);
app.use("/interests", interestRouter);
app.use("/posts", postsRouter);

app.get("/", async(req, res) => {
    return res.status(200).send({message: "welcome to b-blog api"});
});


/*app.listen(process.env.PORT, () => {
    console.log(`Node server started running at post: ${process.env.PORT}`);
});*/

export default app;