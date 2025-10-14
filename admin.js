const bcrypt = require("bcrypt");
const saltRounds = 10;
const plainPassword = "adminpassword123"; // Ganti dengan password yang Anda inginkan

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error("Gagal membuat hash:", err);
    return;
  }
  console.log("Password Anda (plain):", plainPassword);
  console.log("Password Hash (untuk database):");
  console.log(hash);
});
