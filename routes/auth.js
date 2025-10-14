const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const router = express.Router();

// Menampilkan halaman login
router.get("/login", (req, res) => {
  res.render("login", { error: req.query.error });
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

// Catatan: Anda juga memerlukan rute dan halaman registrasi
// untuk membuat pengguna dan melakukan hash pada password mereka dengan bcrypt.
// Contoh untuk membuat pengguna (jalankan ini sekali secara manual atau buat halaman registrasi):
/*
const saltRounds = 10;
const plainPassword = 'adminpassword';
bcrypt.hash(plainPassword, saltRounds, async (err, hash) => {
    if (err) console.error(err);
    // Simpan hash ini di database Anda
    // await db.query(
    //     'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
    //     ['Admin Permit', 'admin@alita.com', hash]
    // );
});
*/

module.exports = router;
