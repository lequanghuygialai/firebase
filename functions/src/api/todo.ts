import { db } from "../utils/admin";
import { Request, Response } from "express";

interface Todo {
  todoId: string;
  title: string;
  body: string;
  createdAt: Date;
}

export const getAllTodos = (_request: Request, response: Response) => {
  db.collection("todos")
    .orderBy("createdAt", "desc")
    .get()
    .then((data: any) => {
      let todos: Todo[] = [];
      data.forEach((doc: any) => {
        todos.push({
          todoId: doc.id,
          title: doc.data().title,
          body: doc.data().body,
          createdAt: doc.data().createdAt,
        });
      });
      return response.json(todos);
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

export const postOneTodo = (request: Request, response: Response) => {
  if (request.body.body.trim() === "") {
    return response.status(400).json({ body: "Must not be empty" });
  }

  if (request.body.title.trim() === "") {
    return response.status(400).json({ title: "Must not be empty" });
  }

  db.collection("todos")
    .add({
      title: request.body.title,
      body: request.body.body,
      createdAt: new Date().toISOString(),
    })
    .then((doc) => {
      return response.json(doc.id);
    })
    .catch((err) => {
      console.error(err);
    });

  return response.status(500).json({ error: "Something went wrong" });
};

export const deleteTodo = (request: Request, response: Response) => {
  db.doc(`/todos/${request.params.todoId}`)
    .delete()
    .then(() => {
      return response.json({ message: "Delete successfull" });
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

export const editTodo = (request: Request, response: Response) => {
  if (request.body.todoId || request.body.createdAt) {
    response.status(403).json({ message: "Not allowed to edit" });
  }

  db.collection("todos")
    .doc(`${request.params.todoId}`)
    .update(request.body)
    .then(() => {
      response.json({ message: "Updated successfully" });
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({
        error: err.code,
      });
    });
};
