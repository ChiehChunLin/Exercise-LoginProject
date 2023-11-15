// import passport from "passport";
import { Router } from "express";
const router = Router();

import Post from "../models/post-model.js";

const authCheck = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    console.log("authCheck: " + req.session.returnTo);
    res.redirect("/auth/login");
  } else {
    next();
  }
};
router.get("/", authCheck, async (req, res) => {
  let postFound = await Post.find({ author: req.user._id });
  res.render("profile", { user: req.user, posts: postFound });
});

router.get("/post", authCheck, (req, res) => {
  res.render("post", { user: req.user });
});

router.post("/post", authCheck, async (req, res) => {
  let { title, content } = req.body;
  let newPost = new Post({ title, content, author: req.user._id });
  try {
    await newPost.save();
    res.status(200).redirect("/profile");
  } catch (err) {
    req.flash("error_msg", "Both title and content are required.");
    res.status(200).redirect("/profile/post");
  }
});
export default router;
