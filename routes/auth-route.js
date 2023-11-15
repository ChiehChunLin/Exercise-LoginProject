import passport from "passport";
import bcrypt from "bcrypt";
import { Router } from "express";
const router = Router();

import User from "../models/user-model.js";

router.get("/login", (req, res) => {
  // if (req.session.returnTo) {
  //   returnTo = req.session.returnTo;
  // }
  res.render("login", { user: req.user });
});

router.get("/signup", (req, res) => {
  res.render("signup", { user: req.user });
});

router.get("/logout", (req, res) => {
  console.log("req.logout");
  req.logOut((err) => {
    if (err) {
      console.error(err);
      res.status(400).send("logout error: " + err);
    }
    res.redirect("/");
  });
});

router.post("/login", (req, res, next) => {
  console.log("/login post: " + JSON.stringify(req.session, null, 2));
  let newPath = "/profile";
  if (req.session.returnTo) {
    newPath = req.session.returnTo;
    req.session.returnTo = "";
  }
  console.log("/login post: newPath " + newPath);
  passport.authenticate("local", {
    successRedirect: newPath,
    failureRedirect: "/auth/login",
    failureFlash: "Wrong email or password.",
  })(req, res, next);
});

router.post("/signup", async (req, res) => {
  console.log(req.body);
  let { name, email, password } = req.body;
  //check if the data is already in db
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    req.flash("error_msg", "Email has already been registered.");
    res.redirect("/auth/signup");
    // res.status(400).send({ msg: "User/Email exists.", savedObj: saveUser });
  }
  const hash = await bcrypt.hash(password, 10);
  password = hash;
  let newUser = new User({ name, email, password });
  try {
    await newUser.save();
    req.flash("success_msg", "Registration succeeds. You can login now.");
    res.redirect("/auth/login");
    // res.status(200).send({ msg: "User saved.", savedObj: saveUser });
  } catch (err) {
    // console.log(err);
    req.flash("error_msg", err.errors.name.properties.message);
    res.redirect("/auth/signup");
    // res.status(400).send(err);
  }
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    //若希望使用者每次登入系統時，可以選擇登入的帳號，則需要加入
    //prompt: "select_account",
  })
);

router.get("/google/redirect", (req, res, next) => {
  console.log("/google/redirect: " + JSON.stringify(req.session, null, 2));
  let newPath = "/profile";
  if (req.session.returnTo) {
    newPath = req.session.returnTo;
    req.session.returnTo = "";
  }
  console.log("/google/redirect: newPath " + newPath);
  passport.authenticate("google", {
    successRedirect: newPath,
    failureRedirect: "/login",
  })(req, res, next);
});
export default router;
