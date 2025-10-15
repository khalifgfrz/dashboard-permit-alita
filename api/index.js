// GANTI SEMUA ISI api/index.js DENGAN KODE INI

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const pg = require("pg");
const PgStore = require("connect-pg-simple")(session);

const authRoutes = require("../routes/auth");
const dashboardRoutes = require("../routes/dashboard");

const app = express();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("trust proxy", 1);

app.use(
  session({
    store: new PgStore({
      pool: pool,
      tableName: "user_sessions",
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // secure: true MEWAJIBKAN 'trust proxy'
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 hari
    },
  })
);

app.get("/", (req, res) => {
  res.redirect("/login");
});
app.use(authRoutes);
app.use(dashboardRoutes);

module.exports = app;
