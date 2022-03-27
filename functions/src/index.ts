import * as express from "express";
import { Application } from "express";
import * as functions from "firebase-functions";
import { deleteTodo, editTodo, getAllTodos, postOneTodo } from "./api/todo";
import { loginUser, signUpUser } from "./api/user";

// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", { structuredData: true });
//   response.send("Hello from Firebase!");
// });

const app: Application = express();

app.get("/todos", getAllTodos);
app.post("/todos", postOneTodo);
app.delete("/todos/:todoId", deleteTodo);
app.put("/todos/:todoId", editTodo);

app.post("/login", loginUser);
app.post("/signup", signUpUser);

export const api = functions.https.onRequest(app);
