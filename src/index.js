const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const dataUser = users.find((user) => user.username === username);

  if (!dataUser) {
    return response.status(404).send({
      error: "Mensagem do erro",
    });
  }

  request.dataUser = dataUser;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  const userAlredyExists = users.find((user) => user.username === username);

  if (userAlredyExists) {
    return response.status(400).send({
      error: "User alredy exists",
    });
  }

  users.push(user);

  return response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  return response.send(request.dataUser.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  request.dataUser.todos.push(todo);

  return response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { id } = request.params;

  if (!id) {
    return response.status(404).send({
      error: "Todo is not exists",
    });
  }

  const todoToEdit = request.dataUser.todos.find((todo) => todo.id === id);

  if (!todoToEdit) {
    return response.status(404).send({
      error: "Todo is not exists",
    });
  }

  Object.assign(todoToEdit, {
    title,
    deadline: new Date(deadline),
  });

  return response.status(200).send(todoToEdit);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  if (!id) {
    return response.status(404).send({
      error: "Todo is not exists",
    });
  }

  const todoToEdit = request.dataUser.todos.find((todo) => todo.id === id);

  if (!todoToEdit) {
    return response.status(404).send({
      error: "Todo is not exists",
    });
  }

  Object.assign(todoToEdit, {
    done: true,
  });
  return response.status(200).send(todoToEdit);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  if (!id) {
    return response.status(404).send({
      error: "Todo is not exists",
    });
  }

  const todoToDelete = request.dataUser.todos.find((todo) => todo.id === id);

  if (!todoToDelete) {
    return response.status(404).send({
      error: "Todo is not exists",
    });
  }

  request.dataUser.todos = request.dataUser.todos.filter(
    (todo) => todo !== todoToDelete
  );
  return response.status(204).send({ success: true });
});

module.exports = app;
