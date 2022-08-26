const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");
const app = express();

app.use(cors());
app.use(express.json());
const users = [];

function checkExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" }); //Não deve ser possível criar um novo usuário quando o nome de usuário já existe/
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const existsUser = users.find((user) => user.username === username);

  if (existsUser) {
    return response.status(400).json({ error: "already existing username" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(user);
  return response.status(201).json(user);
});

app.get("/todos", checkExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "message error" }); //analisa se o todo nao existe/
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch("/todos/:id/done", checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "message error" });
  }

  todo.done = true;

  return response.json(todo);
});

app.delete("/todos/:id", checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExcluded = user.todos.findIndex((todo) => todo.id === id);

  if (todoExcluded === -1) {
    return response.status(404).json({ error: "todo excluded" });
  }

  user.todos.splice(todoExcluded, 1);

  return response.status(204).json();
});

module.exports = app;
