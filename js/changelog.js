// Changelog page. The release data (RELEASES) is generated into js/releases.js from Certaro's
// CHANGELOG.md by tools/changelog/sync.py; this file only renders it.

const GROUP_LABELS = {
  es: { Added: "Nuevo", Changed: "Mejorado", Fixed: "Corregido", Removed: "Eliminado" },
  en: { Added: "New", Changed: "Improved", Fixed: "Fixed", Removed: "Removed" }
};

let isExpanded = false;

function lang() {
  return (typeof currentLang !== "undefined" ? currentLang : "es");
}

// Dates come as YYYY-MM-DD; format them in the page language without a time-zone shift.
function formatDate(iso, l) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString(l === "en" ? "en-US" : "es-AR", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Inline Markdown subset: **bold** and `code`.
function inline(text) {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function renderChangelog() {
  const container = document.getElementById("changelog-timeline");
  const loading = document.getElementById("changelog-loading");
  if (loading) loading.style.display = "none";
  if (!container) return;
  const l = lang();
  const list = isExpanded ? RELEASES : RELEASES.slice(0, 2);
  container.innerHTML = list.map((r, i) => {
    const groups = r.groups.map(g => `<div class="cl-group">
        <span class="cl-tag ${g.type.toLowerCase()}">${escapeHtml(GROUP_LABELS[l][g.type] || g.type)}</span>
        <ul>${g[l].map(it => `<li>${inline(it)}</li>`).join("")}</ul>
      </div>`).join("");
    return `<article class="cl-entry ${i === 0 ? "cl-latest" : ""}">
      <div class="cl-dot">${String(RELEASES.length - i).padStart(2, "0")}</div>
      <div class="cl-card">
        <div class="cl-card-head">
          <span class="cl-version">v${escapeHtml(r.version)}</span>
          <span class="cl-date">${escapeHtml(formatDate(r.date, l))}</span>
          ${i === 0 ? `<span class="cl-badge">${t("changelog.latest")}</span>` : ""}
        </div>
        ${groups}
      </div>
    </article>`;
  }).join("");

  const btn = document.getElementById("changelog-toggle");
  if (btn) {
    if (RELEASES.length > 2) {
      btn.style.display = "inline-flex";
      btn.textContent = t(isExpanded ? "changelog.showLess" : "changelog.showMore");
      btn.onclick = () => { isExpanded = !isExpanded; renderChangelog(); };
    } else {
      btn.style.display = "none";
    }
  }
}

window.addEventListener("certaro:localechange", renderChangelog);
document.addEventListener("DOMContentLoaded", renderChangelog);
