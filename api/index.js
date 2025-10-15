// GANTI SEMUA ISI api/index.js DENGAN KODE INI

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const pg = require("pg"); // Library pg diperlukan
const PgStore = require("connect-pg-simple")(session); // Impor session store

const authRoutes = require("../routes/auth");
const dashboardRoutes = require("../routes/dashboard");

const app = express();

// Buat koneksi pool ke database, khusus untuk session store
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Pengaturan SSL ini tetap penting
  },
});

// Konfigurasi View & Static Files
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// KONFIGURASI SESSION BARU YANG SUDAH DIPERBAIKI
app.use(
  session({
    store: new PgStore({
      pool: pool, // Gunakan koneksi pool yang sudah kita buat
      tableName: "user_sessions", // Nama tabel yang tadi kita buat
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Selalu 'true' untuk production di Vercel
      maxAge: 30 * 24 * 60 * 60 * 1000, // Sesi bertahan selama 30 hari
    },
  })
);

// Routes
app.get("/", (req, res) => {
  res.redirect("/login");
});
app.use(authRoutes);
app.use(dashboardRoutes);

module.exports = app;
