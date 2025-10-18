const express = require("express");
const db = require("../db");
const router = express.Router();

// Middleware untuk melindungi rute
const isAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
};

const isAdmin = (req, res, next) => {
  if (req.session.userRole === "admin") {
    return next();
  }
  res.redirect("/dashboard");
};

// Menampilkan dasbor dengan data permit
router.get("/dashboard", isAuth, async (req, res) => {
  try {
    let result;
    // Jika yang login adalah admin, tampilkan SEMUA permit
    if (req.session.userRole === "admin") {
      result = await db.query("SELECT * FROM permits ORDER BY created_at DESC");
    } else {
      // Jika pengguna biasa, tampilkan permit miliknya saja
      const currentUserId = req.session.userId;
      result = await db.query(
        "SELECT * FROM permits WHERE user_id = $1 ORDER BY created_at DESC",
        [currentUserId]
      );
    }

    res.render("dashboard", {
      user: { name: req.session.userName },
      permits: result.rows,
      userRole: req.session.userRole, // Kirim role ke frontend
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching permit data.");
  }
});

// Menangani pengiriman formulir permintaan permit baru
router.post("/request-permit", isAuth, async (req, res) => {
  const {
    permitType,
    Lps,
    Aep,
    Vendor,
    Ntw,
    Ldp,
    Sd,
    FD,
    projectName,
    systemKey,
    regional,
    provinsi,
    scopePekerjaan,
    siteIdNE,
    siteNameNE,
    towerProviderNE,
    siteIdFE,
    siteNameFE,
    towerProviderFE,
    picOnsite,
  } = req.body;

  // Membuat ID tiket unik
  const ticketCountResult = await db.query("SELECT COUNT(*) FROM permits");
  const newTicketNumber = parseInt(ticketCountResult.rows[0].count, 10) + 1;
  const ticketId = `PRM-${String(newTicketNumber).padStart(4, "0")}`;

  try {
    const query = `
            INSERT INTO permits (
                user_id, ticket_id, permit_type, previous_permit_link, extend_reason,
                vendor_name, vendor_phone, pic_data_link, start_date, finish_date,
                project_name, system_key, regional, province, work_scope,
                site_id_ne, site_name_ne, tower_provider_ne, site_id_fe,
                site_name_fe, tower_provider_fe, pic_onsite
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        `;
    const values = [
      req.session.userId,
      ticketId,
      permitType,
      Lps,
      Aep,
      Vendor,
      Ntw,
      Ldp,
      Sd,
      FD,
      projectName,
      systemKey,
      regional,
      provinsi,
      scopePekerjaan,
      siteIdNE,
      siteNameNE,
      towerProviderNE,
      siteIdFE,
      siteNameFE,
      towerProviderFE,
      picOnsite,
    ];

    await db.query(query, values);
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal mengirimkan permintaan permit.");
  }
});

router.post("/permit/update/:id", isAuth, isAdmin, async (req, res) => {
  try {
    const permitId = req.params.id;
    // Ambil data 'status' dan 'link' yang dikirim oleh JavaScript
    const { status, final_permit_link } = req.body;

    await db.query(
      "UPDATE permits SET status = $1, final_permit_link = $2, updated_at = NOW() WHERE id = $3",
      [status, final_permit_link, permitId]
    );

    // Kirim balasan sukses dalam format JSON ke JavaScript
    res.json({ success: true, message: "Permit updated successfully." });
  } catch (err) {
    console.error(err);
    // Kirim balasan error jika gagal
    res
      .status(500)
      .json({ success: false, message: "Failed to update permit." });
  }
});

router.get("/permit/details/:id", isAuth, async (req, res) => {
  try {
    const permitId = req.params.id;
    const currentUserId = req.session.userId;
    const currentUserRole = req.session.userRole;

    const result = await db.query("SELECT * FROM permits WHERE id = $1", [
      permitId,
    ]);

    if (result.rows.length === 0) {
      console.log(`Permit with ID ${permitId} not found.`);
      return res.redirect("/dashboard?error=Permit not found");
    }

    const permit = result.rows[0];

    if (currentUserRole !== "admin" && permit.user_id !== currentUserId) {
      console.log(
        `User ${currentUserId} attempted to access permit ${permitId} owned by ${permit.user_id}`
      );
      return res.redirect("/dashboard?error=Access denied");
    }

    res.render("permit-details", { permit: permit });
  } catch (err) {
    console.error("Error fetching permit details:", err);
    res.redirect("/dashboard?error=Failed to load details");
  }
});

router.delete("/permit/delete/:id", isAuth, isAdmin, async (req, res) => {
  try {
    const permitId = req.params.id;

    const deleteResult = await db.query("DELETE FROM permits WHERE id = $1", [
      permitId,
    ]);

    if (deleteResult.rowCount > 0) {
      res.json({ success: true, message: "Permit deleted successfully." });
    } else {
      res.status(404).json({ success: false, message: "Permit not found." });
    }
  } catch (err) {
    console.error("Error deleting permit:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete permit." });
  }
});

module.exports = router;
