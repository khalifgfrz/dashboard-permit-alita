// Sidebar toggling for sections
const buttons = Array.from(document.querySelectorAll(".nav-btn[data-target]"));
const sections = Array.from(document.querySelectorAll(".section"));
function setActive(targetId) {
  // Toggle nav state
  buttons.forEach((btn) => {
    const isActive = btn.dataset.target === targetId;
    btn.setAttribute("aria-current", isActive ? "page" : "false");
  });
  // Toggle sections
  sections.forEach((sec) => {
    sec.classList.toggle("active", sec.id === targetId);
  });
  // Move focus to main for accessibility
  document.getElementById("content").focus({ preventScroll: false });
  // Close sidebar on mobile after selection
  document.body.classList.remove("sidebar-open");
  document.getElementById("sidebarToggle").setAttribute("aria-expanded", "false");
}
buttons.forEach((btn) => {
  btn.addEventListener("click", () => setActive(btn.dataset.target));
  btn.addEventListener("keyup", (e) => {
    if (e.key === "Enter" || e.key === " ") setActive(btn.dataset.target);
  });
});

// Mobile sidebar toggle
const toggle = document.getElementById("sidebarToggle");
toggle.addEventListener("click", () => {
  const open = !document.body.classList.contains("sidebar-open");
  document.body.classList.toggle("sidebar-open", open);
  toggle.setAttribute("aria-expanded", String(open));
});
