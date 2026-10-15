// Changelog page. The product repository is private, so the history is kept here, bilingual,
// condensed from Certaro's CHANGELOG.md. Add a new entry at the top of RELEASES for each release.
const RELEASES = [
  {
    version: "2.0.0",
    date: { es: "2 de septiembre de 2026", en: "September 2, 2026" },
    groups: [
      {
        type: "Added",
        es: [
          "**Varios motores de base de datos**: SQLite (escritorio local), PostgreSQL (servidor/Docker) y MySQL / MariaDB, con migraciones portables entre dialectos.",
          "**Autenticación y roles (RBAC)**: contraseñas con Argon2id, sesiones JWT, segundo factor TOTP y 39 permisos granulares. En escritorio con SQLite el acceso es transparente, sin login.",
          "**Tablero Kanban**: columnas configurables, límites WIP, prioridades, descripciones en markdown y listas de tareas; tableros prearmados de Trabajos y Órdenes de Trabajo sincronizados con su estado.",
          "**Calendario y planificador**: vistas de mes, semana, día y por recurso; muestra feriados, inicios y vencimientos de trabajos y vencimientos de facturas; grupos de recursos (personal, vehículos, equipos).",
          "**Respaldo y restauración unificados**: volcado JSON de las 38 tablas de negocio, con orden de dependencias y transacciones atómicas."
        ],
        en: [
          "**Multiple database engines**: SQLite (local desktop), PostgreSQL (server/Docker) and MySQL / MariaDB, with portable migrations across dialects.",
          "**Authentication and roles (RBAC)**: Argon2id password hashing, JWT sessions, TOTP second factor and 39 granular permissions. On SQLite desktop, access is transparent with no login.",
          "**Kanban board**: configurable columns, WIP limits, priorities, markdown descriptions and checklists; preset Jobs and Work Orders boards kept in sync with their status.",
          "**Calendar and scheduler**: month, week, day and resource views; shows holidays, job start and due dates and invoice due dates; resource groups (staff, vehicles, equipment).",
          "**Unified backup and restore**: JSON dump of all 38 business tables, in dependency order and with atomic transactions."
        ]
      }
    ]
  },
  {
    version: "0.1.0",
    date: { es: "30 de agosto de 2026", en: "August 30, 2026" },
    groups: [
      {
        type: "Added",
        es: [
          "**Panel**: indicadores, gráficos mensuales, rankings de rentabilidad, cuenta corriente, antigüedad de deuda y cotizaciones del dólar.",
          "**Movimientos**: libro de caja con filtros, paginado y orden, en ARS y USD con cotización.",
          "**Clientes, obras y trabajos**: contactos múltiples por cliente y estados de obra (pausado, en progreso, finalizado, cancelado).",
          "**Facturas y órdenes de trabajo**: pagos parciales, reclasificación automática de estados y control de mora.",
          "**Certificados**: certificaciones de avance congeladas, con ajuste UOCRA y exportación a PDF.",
          "**Personal**: empleados, asistencia diaria por tipo de día y liquidaciones con recargos, descuento de adelantos y PDF.",
          "**Reportes y archivos**: exportación a PDF, XLSX, DOCX, CSV y JSON; adjuntos con validación; backups automáticos y manuales; exportación e importación JSON.",
          "**Interfaz**: español e inglés, tema claro, oscuro o del sistema, y atajos de teclado."
        ],
        en: [
          "**Dashboard**: KPIs, monthly charts, profitability rankings, current account, debt aging and USD exchange rates.",
          "**Movements**: cash ledger with filtering, paging and sorting, in ARS and USD with exchange rates.",
          "**Clients, sites and jobs**: multiple contacts per client and site states (paused, in progress, finished, cancelled).",
          "**Invoices and work orders**: partial payments, automatic state reclassification and overdue tracking.",
          "**Certificates**: frozen progress certificates with UOCRA adjustment and PDF export.",
          "**Staff**: employees, daily attendance by day type and payroll settlements with premiums, advance deduction and PDF.",
          "**Reports and files**: export to PDF, XLSX, DOCX, CSV and JSON; validated attachments; automatic and manual backups; JSON export and import.",
          "**Interface**: Spanish and English, light, dark or system theme, and keyboard shortcuts."
        ]
      }
    ]
  }
];

const GROUP_LABELS = {
  es: { Added: "Nuevo", Changed: "Mejorado", Fixed: "Corregido", Removed: "Eliminado" },
  en: { Added: "New", Changed: "Improved", Fixed: "Fixed", Removed: "Removed" }
};

let isExpanded = false;

function lang() {
  return (typeof currentLang !== "undefined" ? currentLang : "es");
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
          <span class="cl-date">${escapeHtml(r.date[l])}</span>
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
