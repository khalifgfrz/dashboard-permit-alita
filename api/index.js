// File: api/index.js

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const authRoutes = require("../routes/auth");
const dashboardRoutes = require("../routes/dashboard");

const app = express();

app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));

app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session management
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

app.get("/", (req, res) => {
  res.redirect("/login");
});
app.use(authRoutes);
app.use(dashboardRoutes);

module.exports = app;
