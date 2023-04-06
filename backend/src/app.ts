import bodyParser from "body-parser";
import express from "express";
import { userRouter } from "./items/user";

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());
//app.use(express.json());

app.use("/user", userRouter);

app.get("/", async(req, res) => {
    return res.status(200).send({message: "welcome to b-blog api"});
});


/*app.listen(process.env.PORT, () => {
    console.log(`Node server started running at post: ${process.env.PORT}`);
});*/

export default app;