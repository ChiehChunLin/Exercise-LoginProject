import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import LocalStrategy from "passport-local";
import { config } from "dotenv";
config(); // and create a ".env" file in folder
import User from "../models/user-model.js";
import bycrpt from "bcrypt";

// passport ref: https://www.passportjs.org/
// passport-google-oauth20 ref:  https://www.passportjs.org/packages/passport-google-oauth20/

//after google authentication
// req.useuse

passport.serializeUser((user, done) => {
  console.log("Serializing user now");
  done(null, user._id);
});

passport.deserializeUser((_id, done) => {
  console.log("Deserializing user now");
  User.findById({ _id }).then((user) => {
    console.log("Find user.");
    done(null, user);
  });
});

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ email: username })
      .then(async (user) => {
        if (!user) {
          return done(null, false);
        }
        await bycrpt.compare(password, user.password, function (err, result) {
          if (err) {
            return done(err);
          }
          if (!result) {
            return done(null, false);
          } else {
            return done(null, user);
          }
        });
      })
      .catch((err) => {
        // return done(null, false);
        return done(err);
      });
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    (accessToken, refreshToken, profile, done) => {
      //passport callback
      let userFile = JSON.stringify(profile, null, 2);
      userFile = JSON.parse(userFile);
      //   console.log(userFile);
      //   console.log(
      //     `content: username: ${userFile.displayName},\n Google ID: ${userFile.id},\n photo: ${userFile.photos?.[0]?.value}`
      //   );

      User.findOne({ googleID: userFile.id }).then((foundUser) => {
        if (foundUser) {
          //User exists, Take out the data
          console.log("User already exist");
          done(null, foundUser);
        } else {
          //User doesn't exist, create data into mongoDB
          new User({
            name: userFile.displayName,
            googleID: userFile.id,
            thumbnail: userFile.photos?.[0]?.value,
            email: userFile.emails?.[0]?.value,
          })
            .save()
            .then((newUser) => {
              console.log("New user created.");
              done(null, newUser);
            });
        }
      });
    }
  )
);
