require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 3000;

// Mengatur view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public"))); // Menyajikan file statis (CSS, JS)
app.use(express.urlencoded({ extended: true })); // Mem-parsing data formulir

// Manajemen session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Atur ke true jika menggunakan HTTPS
  })
);

// Rute (Routes)
app.get("/", (req, res) => {
  res.render("index");
});

app.use(authRoutes);
app.use(dashboardRoutes);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
