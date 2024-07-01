const supertest = require("supertest");
const app = require("../app");
const { describe, test, expect, beforeAll } = require("@jest/globals");
const db = require("../db");
const api = supertest(app);
let user = undefined;
let tasks = [
  {
    name: "Lavar la ropa",
    task_check: 0,
  },
  {
    name: "Barrer la sala",
    task_check: 0,
  },
  {
    name: "Hacer la comida",
    task_check: 0,
  },
];

let users = [
  {
    username: "juanpinto1",
    password: "bye.123",
  },
  {
    username: "joseperez",
    password: "hola.123",
  },
];

describe("test tasks endpoint /api/tasks", () => {
  describe("post", () => {
    beforeAll(() => {
      // Borra todos los usuarios
      db.prepare("DELETE FROM users").run();
      db.prepare("DELETE FROM tasks").run();

      // Crear un usuario
      user = db
        .prepare(
          `
        INSERT INTO users (username, password)
        VALUES (?, ?)
        RETURNING *
      `
        )
        .get("Juan Pinto", "Secreto.123");
    });
    test("crea un nueva tarea cuando no esta vacio el campo", async () => {
      const tasksBefore = db.prepare("SELECT * FROM tasks").all();
      const newTask = {
        name: "Lavar la ropa",
        task_check: 0,
      };
      const response = await api
        .post("/api/tasks")
        .query({ userId: user.user_id })
        .send(newTask)
        .expect(201)
        .expect("Content-Type", /json/);
      const tasksAfter = db.prepare("SELECT * FROM tasks").all();
      expect(tasksAfter.length).toBe(tasksBefore.length + 1);
      expect(response.body).toStrictEqual({
        task_id: 1,
        name: "Lavar la ropa",
        task_check: 0,
        user_id: 1,
      });
    });
    test("no crea una tarea cuando el campo esta vacio", async () => {
      const tasksBefore = db.prepare("SELECT * FROM tasks").all();
      const newTask = {
        name: "",
        task_check: null,
      };
      const response = await api
        .post("/api/tasks")
        .query({ userId: user.user_id })
        .send(newTask)
        .expect(400)
        .expect("Content-Type", /json/);
      const tasksAfter = db.prepare("SELECT * FROM tasks").all();
      expect(tasksAfter.length).toBe(tasksBefore.length);
      expect(response.body).toStrictEqual({
        error: "El campo no puede estar vacio",
      });
    });
    test("no crea una tarea cuando el usuario no inicio sesion", async () => {
      const tasksBefore = db.prepare("SELECT * FROM tasks").all();
      const newTask = {
        name: "Barrer la sala",
        task_check: 0,
      };
      await api
        .post("/api/tasks")
        .query({ userId: null })
        .send(newTask)
        .expect(403);
      const tasksAfter = db.prepare("SELECT * FROM tasks").all();
      expect(tasksAfter.length).toBe(tasksBefore.length);
    });
  });
  describe("put", () => {
    beforeAll(() => {
      // Borra todos los usuarios
      db.prepare("DELETE FROM users").run();
      db.prepare("DELETE FROM tasks").run();

      // Crear un usuario

      users = users.map((user) => {
        return (user = db
          .prepare(
            `
          INSERT INTO users (username, password)
          VALUES (?, ?)
          RETURNING *
        `
          )
          .get(user.username, user.password));
      });
      // Crea la lista de las (map) tarea
      tasks = tasks.map((task) => {
        return db
          .prepare(
            `
           INSERT INTO tasks (name, task_check, user_id)
           VALUES (?, ?, ?)
           RETURNING *
           `
          )
          .get(task.name, task.task_check, users[0].user_id);
      });
    });
    test("actualiza el estatus de la tarea cuando ya se realizo", async () => {
      const updatedParams = {
        name: "Lavar la ropa",
        task_check: 1,
      };

      const response = await api
        .put(`/api/tasks/${tasks[0].task_id}`)
        .query({ userId: users[0].user_id })
        .send(updatedParams)
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        name: "Lavar la ropa",
        task_check: 1,
        task_id: 1,
        user_id: 1,
      });
    });
    test("no actualiza cuando no es el usuario", async () => {
      const updatedParams = {
        name: "Lavar la ropa",
        task_check: 0,
      };

      const response = await api
        .put(`/api/tasks/${tasks[0].task_id}`)
        .query({ userId: 2 })
        .send(updatedParams)
        .expect(403)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        error: "No tienes los permisos",
      });
    });
  });
  describe("delete", () => {
    beforeAll(() => {
      // Borra todos los usuarios
      db.prepare("DELETE FROM users").run();
      db.prepare("DELETE FROM tasks").run();

      // Crear un usuario

      users = users.map((user) => {
        return (user = db
          .prepare(
            `
          INSERT INTO users (username, password)
          VALUES (?, ?)
          RETURNING *
        `
          )
          .get(user.username, user.password));
      });
      // Crear las tareas
      tasks = tasks.map((task) => {
        return db
          .prepare(
            `
           INSERT INTO tasks (name, task_check, user_id)
           VALUES (?, ?, ?)
           RETURNING *
           `
          )
          .get(task.name, task.task_check, users[0].user_id);
      });
    });
    test("elimina una tarea", async () => {
      const task = tasks[0];

      const response = await api
        .delete(`/api/tasks/${task.task_id}`)
        .query({ userId: users[0].user_id })
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        message: "la tarea se ha eliminado correctamente",
      });
    });
    test("no elimina la tarea cuando no existe", async () => {
      const response = await api
        .delete(`/api/tasks/1000`)
        .query({ userId: users[0].user_id })
        .expect(400)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        error: "la tarea no existe",
      });
    });
    test("no elimina la tarea cuando no es del usuario", async () => {
      const response = await api
        .delete(`/api/tasks/${tasks[1].task_id}`)
        .query({ userId: users[1].user_id })
        .expect(400)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        error: "la tarea no existe",
      });
    });
  });
});
