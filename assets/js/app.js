/* ============================================================
   app.js — Router, theme, khởi tạo ứng dụng
   ============================================================ */
(function (global) {
  "use strict";

  const ROUTES = {
    dashboard: { title: "Bảng điều khiển", render: () => Views.dashboard() },
    roadmap:   { title: "Lộ trình 12 tháng", render: () => Views.roadmap() },
    vocab:     { title: "Từ vựng (FSRS)", render: () => Views.vocab() },
    pron:      { title: "Phát âm", render: () => Views.pron() },
    shadow:    { title: "Shadowing", render: () => Views.shadow() },
    coach:     { title: "Luyện nói với AI", render: () => Views.coach() },
    defense:   { title: "Mô phỏng bảo vệ", render: () => Views.defense() },
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

  // Dọn dẹp tài nguyên của view cũ (timer, micro, listener toàn cục)
  // trước khi vẽ view mới — view đăng ký qua App.onCleanup(fn).
  let cleanups = [];
  function runCleanups() {
    const list = cleanups; cleanups = [];
    list.forEach((fn) => { try { fn(); } catch (e) {} });
  }

  function render() {
    runCleanups();
    const name = currentRoute();
    const route = ROUTES[name];

    const pb = document.getElementById("topbar-progress");
    pb.style.opacity = "1"; pb.style.width = "40%";

    viewEl.innerHTML = "";
    try {
      viewEl.appendChild(route.render());
    } catch (e) {
      console.error("Render error:", e);
      viewEl.appendChild(errorPane(e));
    }
    titleEl.textContent = route.title;

    navEl.querySelectorAll(".nav__link").forEach((a) => {
      a.classList.toggle("is-active", a.dataset.route === name);
    });
    const tabbar = document.getElementById("tabbar");
    if (tabbar) tabbar.querySelectorAll(".tabbar__item").forEach((a) => {
      a.classList.toggle("is-active", a.dataset.route === name);
    });

    updateChrome();

    requestAnimationFrame(() => {
      pb.style.width = "100%";
      setTimeout(() => { pb.style.opacity = "0"; pb.style.width = "0"; }, 320);
    });

    window.scrollTo(0, 0);
    document.title = route.title + " · English Defense";
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
    if (dn != null) { dc.textContent = "Ngày " + dn + " · Tháng " + Store.currentMonth(); dc.style.display = ""; }
    else { dc.textContent = "Chưa bắt đầu"; }
    document.getElementById("streak-count").textContent = Store.streak();
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
  function openSidebar() { sidebar.classList.add("open"); scrim.classList.add("show"); document.body.classList.add("nav-open"); }
  function closeSidebar() { sidebar.classList.remove("open"); scrim.classList.remove("show"); document.body.classList.remove("nav-open"); }

  /* ---------- Wire up ---------- */
  function init() {
    initTheme();

    document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
    document.getElementById("menu-toggle").addEventListener("click", openSidebar);
    const more = document.getElementById("tabbar-more");
    if (more) more.addEventListener("click", openSidebar);
    document.getElementById("sidebar-close").addEventListener("click", closeSidebar);
    scrim.addEventListener("click", closeSidebar);

    global.addEventListener("hashchange", render);

    // phím tắt: g rồi d/r/v/p/s/c/m
    let gPressed = false;
    document.addEventListener("keydown", (e) => {
      if (e.target.matches("input, textarea, select")) return;
      if (e.key === "g") { gPressed = true; setTimeout(() => gPressed = false, 800); return; }
      if (gPressed) {
        const map = { d: "dashboard", r: "roadmap", v: "vocab", p: "pron", s: "shadow", c: "coach", m: "defense" };
        if (map[e.key]) { location.hash = "#/" + map[e.key]; gPressed = false; }
      }
    });

    Store.onChange(() => updateChrome());

    if (!location.hash) location.hash = "#/dashboard";
    render();
    registerPWA();
  }

  // ---- PWA ----
  let deferredPrompt = null;
  function registerPWA() {
    if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
    global.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault(); deferredPrompt = e;
    });
  }
  global.installPWA = function () {
    if (!deferredPrompt) { UI.toast("Mở menu trình duyệt → 'Cài đặt ứng dụng' / 'Add to Home screen'"); return; }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.finally(() => { deferredPrompt = null; });
  };

  global.App = { render, currentRoute, onCleanup: (fn) => cleanups.push(fn) };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window);
