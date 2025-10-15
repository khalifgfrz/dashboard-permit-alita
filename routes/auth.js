const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const router = express.Router();

// Menampilkan halaman login
router.get("/login", (req, res) => {
  let successMessage = null;
  if (req.query.success) {
    successMessage = "Registrasi berhasil! Silakan login.";
  }
  res.render("login", { error: req.query.error, success: successMessage });
});

// Menangani logika login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isValid = await bcrypt.compare(password, user.password);

      if (isValid) {
        req.session.userId = user.id; // Simpan ID pengguna di session
        req.session.userName = user.name;
        req.session.userRole = user.role;
        return res.redirect("/dashboard");
      }
    }
    res.redirect("/login?error=Email atau password salah.");
  } catch (err) {
    console.error(err);
    res.redirect("/login?error=Terjadi kesalahan.");
  }
});

// Menangani logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/dashboard"); // Atau tampilkan halaman error
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

router.get("/register", (_, res) => {
  res.render("register", { error: null });
});

router.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render("register", { error: "Password tidak cocok." });
  }

  try {
    const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.render("register", { error: "Email sudah terdaftar." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await db.query("INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)", [name, email, hashedPassword, "requester"]);

    res.redirect("/login?success=true");
  } catch (err) {
    console.error(err);
    res.render("register", { error: "Terjadi kesalahan saat registrasi." });
  }
});

module.exports = router;
