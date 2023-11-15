import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 255 },
  googleID: { type: String },
  date: { type: Date, default: Date.now },
  thumbnail: { type: String },

  //Local login
  email: { type: String, required: true, unique: true },
  password: { type: String, minLength: 6, maxLength: 1024 },
});

const User = mongoose.model("User", userSchema);
export default User;
