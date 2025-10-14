document.addEventListener("DOMContentLoaded", () => {
  // Fungsi untuk beralih antar tab (Request Form & Tracker)
  const buttons = document.querySelectorAll(".nav-btn[data-target]");
  const sections = document.querySelectorAll(".section");

  function setActive(targetId) {
    buttons.forEach((btn) =>
      btn.setAttribute("aria-current", btn.dataset.target === targetId)
    );
    sections.forEach((sec) =>
      sec.classList.toggle("active", sec.id === targetId)
    );
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => setActive(btn.dataset.target));
  });

  // Fungsi untuk mobile sidebar
  const toggle = document.getElementById("sidebarToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = !document.body.classList.contains("sidebar-open");
      document.body.classList.toggle("sidebar-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Gunakan event delegation untuk menangani klik pada tombol yang mungkin belum ada saat halaman dimuat
  const tableBody = document.querySelector("table tbody");
  if (!tableBody) return;

  tableBody.addEventListener("click", function (event) {
    const target = event.target;

    // Jika tombol 'Edit' yang di-klik
    if (target.classList.contains("edit-btn")) {
      const permitId = target.dataset.id;
      handleEdit(permitId);
    }

    // Jika tombol 'Save' yang di-klik
    if (target.classList.contains("save-btn")) {
      const permitId = target.dataset.id;
      handleSave(permitId);
    }

    // Jika tombol 'Cancel' yang di-klik
    if (target.classList.contains("cancel-btn")) {
      const permitId = target.dataset.id;
      handleCancel(permitId);
    }
  });

  // Variabel global untuk menyimpan data asli saat mode edit
  const originalData = {};

  function handleEdit(id) {
    const statusCell = document.getElementById(`status-${id}`);
    const linkCell = document.getElementById(`link-${id}`);
    const actionsCell = document.getElementById(`actions-${id}`);

    // Simpan data asli sebelum diubah
    originalData[id] = {
      statusHTML: statusCell.innerHTML,
      linkHTML: linkCell.innerHTML,
    };

    // Ganti status dengan dropdown/select
    const currentStatusText = statusCell.innerText.trim();
    statusCell.innerHTML = `
            <select id="select-status-${id}" style="padding: 5px; border-radius: 5px;">
                <option value="Pending" ${
                  currentStatusText === "Pending" ? "selected" : ""
                }>Pending</option>
                <option value="Approved" ${
                  currentStatusText === "Approved" ? "selected" : ""
                }>Approved</option>
                <option value="Rejected" ${
                  currentStatusText === "Rejected" ? "selected" : ""
                }>Rejected</option>
            </select>
        `;

    // Ganti link dengan input text
    const linkElement = linkCell.querySelector("a"); // Cari tag <a> di dalam sel
    const currentUrl = linkElement ? linkElement.getAttribute("href") : ""; // Jika <a> ada, ambil href-nya. Jika tidak, kosongkan.
    linkCell.innerHTML = `<input type="text" id="input-link-${id}" value="${currentUrl}" style="width: 100%; padding: 5px; border-radius: 5px;">`;

    // Ganti tombol Edit dengan Save & Cancel
    actionsCell.innerHTML = `
            <button class="save-btn" data-id="${id}" style="color: #28a745; border: none; background: none; cursor: pointer;">Save</button>
            <button class="cancel-btn" data-id="${id}" style="color: #dc3545; border: none; background: none; cursor: pointer; margin-left: 5px;">Cancel</button>
        `;
  }

  async function handleSave(id) {
    const newStatus = document.getElementById(`select-status-${id}`).value;
    const newLink = document.getElementById(`input-link-${id}`).value;

    try {
      // Kirim data ke backend menggunakan Fetch API
      const response = await fetch(`/permit/update/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          final_permit_link: newLink,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Jika sukses, update tampilan di tabel
        const statusCell = document.getElementById(`status-${id}`);
        const linkCell = document.getElementById(`link-${id}`);

        // Buat tampilan status baru sesuai pilihan
        if (newStatus === "Pending") {
          statusCell.innerHTML = `<span style="background: #ffe9d8; color: var(--brand); padding: 4px 8px; border-radius: 999px;">Pending</span>`;
        } else if (newStatus === "Approved") {
          statusCell.innerHTML = `<span style="background: #e5f6ed; color: #198754; padding: 4px 8px; border-radius: 999px;">Approved</span>`;
        } else {
          statusCell.innerHTML = `<span style="background: #f8d7da; color: #721c24; padding: 4px 8px; border-radius: 999px;">${newStatus}</span>`;
        }

        if (newLink) {
          // Jika link ada isinya, buat elemen <a>
          linkCell.innerHTML = `<a href="${newLink}" target="_blank">Klik Disini</a>`;
        } else {
          // Jika link kosong, tampilkan tanda -
          linkCell.innerText = "-";
        }

        // Kembalikan tombol ke 'Edit'
        const actionsCell = document.getElementById(`actions-${id}`);
        actionsCell.innerHTML = `<button class="edit-btn" data-id="${id}" style="color: #007bff; text-decoration: none; background: none; border: none; cursor: pointer;">Edit</button>`;
      } else {
        alert("Gagal menyimpan perubahan: " + result.message);
        handleCancel(id); // Batalkan jika gagal
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan. Coba lagi.");
      handleCancel(id); // Batalkan jika error
    }
  }

  function handleCancel(id) {
    // Kembalikan data ke kondisi semula
    const statusCell = document.getElementById(`status-${id}`);
    const linkCell = document.getElementById(`link-${id}`);
    const actionsCell = document.getElementById(`actions-${id}`);

    if (originalData[id]) {
      statusCell.innerHTML = originalData[id].statusHTML;
      linkCell.innerHTML = originalData[id].linkHTML;
    }

    // Kembalikan tombol ke 'Edit'
    actionsCell.innerHTML = `<button class="edit-btn" data-id="${id}" style="color: #007bff; text-decoration: none; background: none; border: none; cursor: pointer;">Edit</button>`;
  }
});
