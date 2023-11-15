import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import session from "express-session";
import flash from "connect-flash";
import { config } from "dotenv";
config(); // and create a ".env" file in folder

import passport from "passport";
import authRoute from "./routes/auth-route.js";
import profileRoute from "./routes/profile-route.js";
import "./config/passport.js";

const appPort = 8080;
const app = express();
const saltRounds = 5;

mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to mongodb altas.");
  })
  .catch((e) => {
    console.log(e);
  });

// middlewares
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  //利用flash的功能，將signup結束後的成功失敗訊息接回來，再顯示回網頁上
  //否則瀏覽器直接顯示json結果，容易使使用者困惑
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});
app.use("/auth", authRoute);
app.use("/profile", profileRoute);

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.get("/*", (req, res) => {
  res.status(404).send("404 Error!");
});
//error handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Something is broken. We will fix it soon.");
});

app.listen(appPort, () => {
  console.log(`Server running on port ${appPort}.`);
});
