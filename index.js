require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");

require("./config/passport");

const app = express();
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const port = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGO_URI;

mongoose.set("bufferCommands", false);

// DB CONNECT
if (!mongoUri) {
  throw new Error("MONGO_URI is missing in environment variables");
}

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

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
async function startServer() {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    console.warn("Starting server without MongoDB. Google users will not be persisted.");
  }

  app.listen(port, () => {
    console.log("Server running on port", port);
  });
}

startServer();
