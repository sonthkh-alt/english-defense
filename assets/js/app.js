/* ============================================================
   app.js — Router, theme, khởi tạo ứng dụng
   ============================================================ */
(function (global) {
  "use strict";

  const ROUTES = {
    dashboard: { title: "Bảng điều khiển", render: () => Views.dashboard() },
    roadmap:   { title: "Lộ trình 12 tháng", render: () => Views.roadmap() },
    today:     { title: "Buổi học hôm nay", render: () => Views.today() },
    journal:   { title: "Nhật ký & Chuỗi ngày", render: () => Views.journal() },
    questions: { title: "Ngân hàng câu hỏi", render: () => Views.questions() },
    vocab:     { title: "Sổ tay từ vựng", render: () => Views.vocab() },
    rescue:    { title: "Câu cứu nguy", render: () => Views.rescue() },
    resources: { title: "Tài nguyên & Nguồn", render: () => Views.resources() },
    aitools:   { title: "Bộ công cụ AI", render: () => Views.aitools() },
    progress:  { title: "Đo tiến bộ", render: () => Views.progress() },
    settings:  { title: "Cài đặt", render: () => Views.settings() },
  };

  const viewEl = document.getElementById("view");
  const titleEl = document.getElementById("topbar-title");
  const navEl = document.getElementById("nav");

  function currentRoute() {
    const hash = location.hash.replace(/^#\/?/, "");
    const name = hash.split("/")[0] || "dashboard";
    return ROUTES[name] ? name : "dashboard";
  }

  function render() {
    const name = currentRoute();
    const route = ROUTES[name];

    // top progress bar animation
    const pb = document.getElementById("topbar-progress");
    pb.style.opacity = "1"; pb.style.width = "40%";

    // render view
    viewEl.innerHTML = "";
    try {
      viewEl.appendChild(route.render());
    } catch (e) {
      console.error("Render error:", e);
      viewEl.appendChild(errorPane(e));
    }
    titleEl.textContent = route.title;

    // active nav
    navEl.querySelectorAll(".nav__link").forEach((a) => {
      a.classList.toggle("is-active", a.dataset.route === name);
    });

    // day counter + streak
    updateChrome();

    // finish progress bar
    requestAnimationFrame(() => {
      pb.style.width = "100%";
      setTimeout(() => { pb.style.opacity = "0"; pb.style.width = "0"; }, 320);
    });

    // scroll top + focus
    viewEl.scrollTo ? viewEl.scrollTo(0, 0) : (viewEl.scrollTop = 0);
    window.scrollTo(0, 0);
    document.title = route.title + " · English Defense";

    // close mobile sidebar
    closeSidebar();
  }

  function errorPane(e) {
    const { h } = UI;
    return h("div", { class: "empty" }, [
      h("div", { class: "empty__icon" }, "⚠"),
      h("div", { style: { fontWeight: 600 } }, "Có lỗi khi hiển thị trang"),
      h("div", { class: "small mt-1", style: { color: "var(--text-3)" } }, String(e && e.message || e)),
      h("button", { class: "btn btn--ghost btn--sm mt-2", onClick: () => location.hash = "#/dashboard" }, "← Về bảng điều khiển"),
    ]);
  }

  function updateChrome() {
    const dn = Store.dayNumber();
    const dc = document.getElementById("day-counter");
    if (dn != null) { dc.textContent = "Ngày " + dn + " / 365"; dc.style.display = ""; }
    else { dc.textContent = "Chưa bắt đầu"; }

    const streak = Store.streak();
    document.getElementById("streak-count").textContent = streak;
  }

  /* ---------- Theme ---------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0b0d16" : "#4f46e5");
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = theme === "dark" ? "☀" : "◐";
  }
  function initTheme() {
    let theme = Store.settings().theme;
    if (!theme) {
      theme = (global.matchMedia && global.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    }
    applyTheme(theme);
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "dark" ? "light" : "dark";
    Store.setSetting("theme", next);
    applyTheme(next);
  }

  /* ---------- Sidebar (mobile) ---------- */
  const sidebar = document.getElementById("sidebar");
  const scrim = document.getElementById("sidebar-scrim");
  function openSidebar() { sidebar.classList.add("open"); scrim.classList.add("show"); }
  function closeSidebar() { sidebar.classList.remove("open"); scrim.classList.remove("show"); }

  /* ---------- Wire up ---------- */
  function init() {
    initTheme();

    document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
    document.getElementById("menu-toggle").addEventListener("click", openSidebar);
    document.getElementById("sidebar-close").addEventListener("click", closeSidebar);
    scrim.addEventListener("click", closeSidebar);

    global.addEventListener("hashchange", render);

    // keyboard: quick nav (g then d/r/t...) — nhẹ nhàng, không bắt buộc
    let gPressed = false;
    document.addEventListener("keydown", (e) => {
      if (e.target.matches("input, textarea, select")) return;
      if (e.key === "g") { gPressed = true; setTimeout(() => gPressed = false, 800); return; }
      if (gPressed) {
        const map = { d: "dashboard", r: "roadmap", t: "today", j: "journal", q: "questions", v: "vocab", s: "settings" };
        if (map[e.key]) { location.hash = "#/" + map[e.key]; gPressed = false; }
      }
    });

    // re-render chrome khi state đổi (streak badge realtime)
    Store.onChange(() => updateChrome());

    if (!location.hash) location.hash = "#/dashboard";
    render();
  }

  global.App = { render, currentRoute };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window);
