const db = require(".");

const createUsersTable = async () => {
  const statement = db.prepare(`
    CREATE TABLE users (
        user_id INTEGER PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
    `);
  statement.run();
  console.log("Tabla de usuarios creada");
};

const createTasksTable = async () => {
  const statement = db.prepare(`
    CREATE TABLE tasks (
        task_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        task_check INTEGER NOT NULL DEFAULT 0,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id)
          REFERENCES users (user_id)
          ON DELETE CASCADE
    )
    `);
  statement.run();
  console.log("Tabla de tareas creada");
};

const createTables = async () => {
  await createUsersTable();
  await createTasksTable();
};
createTables();
