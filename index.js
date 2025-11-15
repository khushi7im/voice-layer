const express = require("express");
const app = express();
require("dotenv").config();
const mysql = require("mysql2");
const { dbConnection, initDB } = require("./helper");
let { GoogleGenerativeAI } = require("@google/generative-ai");
const port = process.env.PORT;
let routes = require("./routes");
app.use(express.json());
app.use("/", routes);

(async () => {
  await initDB();
  console.log("Database connection successful.");
})();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
