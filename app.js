const express = require("express");
const app = express();
const path = require("path");
const databasePath = path.join(__dirname, "todoApplication.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
let db = null;
const initializeDatabase = async (request, response) => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Running");
    });
  } catch (e) {
    console.log(`Error ${e}`);
    process.exit(1);
  }
};
initializeDatabase();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasTodoProperty = (requestQuery) => {
  return requestQuery.todo !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `
  SELECT
    *
  FROM
  todo
  WHERE
  id=${todoId};`;
  const responseObject = await db.get(query);
  response.send(responseObject);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postQuery = `
  INSERT INTO
  todo(id,todo,priority,status)
  Values
  (${id},'${todo}','${priority}','${status}');`;
  const g = await db.run(postQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  let putQuery = "";
  const { priority, status, todo } = request.query;
  //   console.log(priority, status, todo);
  switch (true) {
    case hasStatusProperty(request.query):
      putQuery = `
            UPDATE
            todo
            SET
            status='${status}';`;
      putQuery = await db.run(putQuery);
      response.send("Status Updated");
      break;
    case hasPriorityProperty(request.query):
      putQuery = `
            UPDATE
            todo
            SET
            priority='${priority}';`;
      putQuery = await db.run(putQuery);
      response.send("Priority Updated");
      break;
    default:
      putQuery = `
            UPDATE
            todo
            SET
            todo='${todo}';`;
      putQuery = await db.run(putQuery);
      response.send("Todo Updated");
  }
});
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `
  DELETE FROM
  todo
  WHERE
  id=${todoId};`;
  const h = await db.run(query);
  response.send("Todo Deleted");
});

module.exports = app;
