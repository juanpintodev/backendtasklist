const db = require("../db");
const TASK_REGEX = /^(?=.*[a-zA-Z0-9]).{1,}$/;
const tasksRouter = require("express").Router();

tasksRouter.post("/", async (req, res) => {
  try {
    //1.obtener tarea del body
    const { name, task_check } = req.body;
    //1.1 Verificar que el nombre y el telefono es correcto
    if (!TASK_REGEX.test(name)) {
      return res.status(400).json({
        error: "El campo no puede estar vacio",
      });
    }

    //2. crear el nueva tarea (guardarlo)
    const statement = db.prepare(`
    INSERT INTO tasks (name, task_check, user_id) VALUES (?, ?, ?)
    RETURNING *
    `);

    //aqui van las variables
    const task = statement.get(name, task_check, req.userId);

    // 4. Enviar la respuesta
    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ error: "Hubo un error" });
  }
});
// dos puntos : convierte en parametro
tasksRouter.put("/:id", async (req, res) => {
  try {
    //1.obtener tarea del body
    const { name, task_check } = req.body;
    //1.1 Verificar que el nombre y el telefono es correcto
    // if (!NAME_REGEX.test(name)) {
    //   return res.status(400).json({
    //     error: "El nombre es invalido",
    //   });
    // } else if (!NUMBER_REGEX.test(phone)) {
    //   return res.status(400).json({
    //     error: "El numero es invalido",
    //   });
    // }

    //2. actualizar el estatus de la tarea (guardarlo), Set modifica los parametros,
    const statement = db.prepare(`
    UPDATE tasks 
    SET
      name = ?,
      task_check = ?
    WHERE task_id = ? AND user_id = ?
    RETURNING *
    `);

    //aqui van las variables
    const task = statement.get(name, task_check, req.params.id, req.userId);
    if (!task) {
      return res.status(403).json({
        error: "No tienes los permisos",
      });
    }
    // 4. Enviar la respuesta
    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({ error: "Hubo un error" });
  }
});

tasksRouter.delete("/:id", async (req, res) => {
  try {
    const statement = db.prepare(`
    DELETE FROM tasks WHERE task_id = ? AND user_id = ?
    `);

    //aqui van las variables
    const { changes } = statement.run(req.params.id, req.userId);

    if (!changes) {
      return res.status(400).json({
        error: "la tarea no existe",
      });
    }
    // 4. Enviar la respuesta
    return res
      .status(200)
      .json({ message: "la tarea se ha eliminado correctamente" });
  } catch (error) {
    console.log("ERROR", error.code);
    return res.status(500).json({ error: "Hubo un error" });
  }
});
module.exports = tasksRouter;
