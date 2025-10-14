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

// Menampilkan dasbor dengan data permit
router.get("/dashboard", isAuth, async (req, res) => {
  try {
    // Ambil semua permit untuk ditampilkan di tracker
    const result = await db.query("SELECT * FROM permits ORDER BY created_at DESC");
    res.render("dashboard", {
      user: { name: req.session.userName },
      permits: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal mengambil data permit.");
  }
});

// Menangani pengiriman formulir permintaan permit baru
router.post("/request-permit", isAuth, async (req, res) => {
  const { permitType, Lps, Aep, Vendor, Ntw, Ldp, Sd, FD, projectName, systemKey, regional, provinsi, scopePekerjaan, siteIdNE, siteNameNE, towerProviderNE, siteIdFE, siteNameFE, towerProviderFE, picOnsite } = req.body;

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

module.exports = router;
