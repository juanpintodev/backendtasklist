const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const usersRouter = require("./routes/users");
const tasksRouter = require("./routes/tasks");
const validateUser = require("./middleware/validateUser");
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true }));

app.get("/", async (request, response) => {
  return response.status(200).json({ hola: "mundo" });
});

app.use("/api/users", usersRouter);
app.use("/api/tasks", validateUser, tasksRouter);

module.exports = app;
