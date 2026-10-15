"""Capture Certaro's screenshots through WebView2's remote-debugging port.

The desktop app must already be running (see README.md) with the demo company loaded. This script
drives the window with Playwright (connect_over_cdp), hides dev-only overlays, rewrites anything
that could be a real name, brand or e-mail address, and writes raw 1600x1000 PNGs.

    python capture.py OUT_DIR
"""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

# The demo seed ships a few real-looking names and brands; swap them for neutral ones.
REPLACEMENTS = {
    "Natalia Oreiro": "Lucía Ferreyra",
    "Ricardo Darín": "Martín Acosta",
    "Schneider": "Norte",
    "Edenor": "EdeNorte",
    "Banco Galicia": "Banco Austral",
    "Banco Santander": "Banco del Sur",
    "Mercado Pago": "Billetera Virtual",
}

CLEAN_JS = r"""
((MAP) => {
  if (!document.getElementById('__hide')) {
    const st = document.createElement('style');
    st.id = '__hide';
    st.textContent = '#p-license-host,.p-toast{display:none!important}';
    document.head.appendChild(st);
  }
  const fix = (s) => {
    if (!s) return s;
    for (const k in MAP) s = s.split(k).join(MAP[k]);
    return s.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, (m) => m.split('@')[0] + '@example.com');
  };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) { const v = fix(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
  document.querySelectorAll('input,textarea').forEach((i) => { const v = fix(i.value); if (v !== i.value) i.value = v; });
})
"""


def main(out: Path) -> None:
    out.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        pg = p.chromium.connect_over_cdp("http://localhost:9222").contexts[0].pages[0]
        pg.set_viewport_size({"width": 1600, "height": 1000})

        def save(name: str) -> None:
            for _ in range(2):
                pg.evaluate(f"({CLEAN_JS})({json.dumps(REPLACEMENTS)})")
                pg.wait_for_timeout(400)
            pg.screenshot(path=str(out / f"{name}.png"))

        def goto(path: str, wait: int = 3000) -> None:
            pg.evaluate(f"history.pushState({{}}, '', '{path}'); dispatchEvent(new PopStateEvent('popstate'))")
            pg.wait_for_timeout(wait)

        # The theme button cycles system -> light -> dark; the app must start in dark.
        goto("/kanban", 3500)
        save("kanban")
        goto("/movimientos")
        save("movimientos")
        pg.keyboard.press("Control+k")
        pg.wait_for_timeout(1000)
        save("palette")
        pg.keyboard.press("Escape")
        pg.wait_for_timeout(400)
        goto("/", 2500)
        pg.get_by_role("button", name="Todo").click()
        pg.wait_for_timeout(2500)
        save("panel")
        pg.mouse.click(1395, 28)  # theme button: dark -> system (light)
        pg.wait_for_timeout(1200)
        save("panel-light")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
