const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const usersRoutes = require("./routes/users");
const expensesRoutes = require("./routes/expenses");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/users", usersRoutes);
app.use("/api/expenses", expensesRoutes);

app.get("/", (req, res) => {
  res.send("404");
});

app.use((req, res, next) => {
  throw new HttpError("Could not find this route.", 404);
});

app.get("*", (req, res) => {
  res.send("404");
});

mongoose
  .connect(
    "mongodb+srv://jasim:Itzmejay01@cluster0.btxb48k.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(
    app.listen(5000, () => {
      console.log("Listening on Port 5000 😍😍😍.");
    })
  )
  .catch((error) => {
    console.error(error);
  });
