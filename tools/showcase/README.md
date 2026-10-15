# Screenshot tooling

The screenshots in `assets/screens` are real captures of the Certaro desktop app (Tauri) running on
the built-in **demo company** ("Demo Servicios y Obras Integrales S.A.", loaded from the welcome
screen with *Cargar datos de demostración*). The demo data is fictional; `capture.py` additionally
rewrites the few names and brands in it that look real (people, banks, a utility, a supplier) and
every e-mail address (to `example.com`) before taking each capture, and hides dev-only overlays.

| File | What it does |
|------|--------------|
| `capture.py` | Drives the running app over WebView2's remote-debugging port and writes raw 1600 x 1000 PNGs. |
| `publish.py` | Converts the PNGs to WebP slides, thumbnails, `assets/icon.png` and the social card. |

Requirements: Windows, Python 3 with `playwright` and `Pillow`, and a checkout of Certaro `main`
(Rust, Node, pnpm; see its README). Playwright only attaches to the WebView2 that the app already
runs, so no browser download is needed.

## Steps

From a copy of Certaro (for example `git archive HEAD`, so the build does not touch your working
tree), with an **isolated data folder** so your real data is never used (PowerShell):

```powershell
# 1. Dev server (the debug build loads http://localhost:1420) and the app, with CDP enabled.
pnpm install
Start-Process pnpm -ArgumentList dev
$env:LOCALAPPDATA = "$env:TEMP\certaro-shots\Local"
$env:APPDATA = "$env:TEMP\certaro-shots\Roaming"
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = "--remote-debugging-port=9222"
$env:WEBVIEW2_USER_DATA_FOLDER = "$env:TEMP\certaro-shots\wv2"
cargo run -p certaro

# 2. In the window: "Cargar datos de demostración", then set the theme button to dark.
# 3. Capture and publish.
python tools/showcase/capture.py $env:TEMP\certaro-shots\raw
python tools/showcase/publish.py $env:TEMP\certaro-shots\raw <path-to-certaro-web>
```

Notes:

- Without a license only the core modules are available (Panel, Movimientos, Clientes, Kanban,
  Calendario), so Obras, Facturas, Certificados and Asistencia cannot be captured, and calendar
  events cannot be created. With a development license, add captures of those screens.
- The theme button cycles system, light and dark; `capture.py` assumes it starts in dark.
- The dev build shows a PrimeUI license badge when no key is configured; `capture.py` hides it.
- Check every capture before publishing: the texts and coordinates depend on the UI.
