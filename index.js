require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");

require("./config/passport");

const app = express();
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

// DB CONNECT
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// SESSION
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// HOME
app.get("/", (req, res) => {
  res.send("<a href='/auth/google'>Login with Google</a>");
});

// GOOGLE LOGIN
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// CALLBACK
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const params = new URLSearchParams({
      auth: "success",
      fullName: req.user?.name || "Customer",
      email: req.user?.email || "",
      profilePic: req.user?.profilePic || "",
      role: "CUSTOMER",
    });
    res.redirect(`${frontendUrl}/?${params.toString()}`);
  }
);

// PROFILE (protected)
app.get("/profile", (req, res) => {
  if (!req.user) return res.redirect("/");

  res.send(`
    <h1>Welcome ${req.user.name}</h1>
    <p>${req.user.email}</p>
    <img src="${req.user.profilePic}" width="100"/>
    <br><br>
    <a href="/logout">Logout</a>
  `);
});

// LOGOUT
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// START SERVER
app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});
