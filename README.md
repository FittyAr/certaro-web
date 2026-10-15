# Certaro — Sitio Web y Landing Page

Repositorio oficial del sitio web de [Certaro](https://certaro.fitty.ar). Vanilla HTML/CSS/JS, sin build step. Se sirve directamente vía GitHub Pages desde la rama `main`.

- `index.html` — landing page (ES/EN vía `js/translations.js`): beneficios, capturas, instalación, planes y contacto
- `changelog.html` + `js/changelog.js` — historial de versiones (bilingüe)
- `js/releases.js` — **generado**: lista `RELEASES` y versión que muestra el sitio (`CERTARO_VERSION`, footers con `data-app-version`). No editar a mano
- `css/base.css` + `css/index.css` — estilos y paleta de diseño
- `assets/` — logotipo, `icon.png`, `social.png` (imagen para redes) y `screens/*.webp` (capturas y miniaturas)
- `llms.txt`, `robots.txt`, `sitemap.xml` — SEO y rastreadores de IA
- `tools/changelog` — `sync.py` regenera `js/releases.js` desde `../Certaro/CHANGELOG.md` (única fuente de verdad de la versión); `i18n.json` guarda el texto resumido es/en de cada versión
- `tools/showcase` — scripts que generan las capturas con datos ficticios (leer su README)
- `CNAME` — dominio personalizado `certaro.fitty.ar`

Las capturas son de la app de escritorio con la empresa de demostración (datos ficticios).

## Versión y novedades

Al publicar una versión de Certaro (nuevo encabezado en su `CHANGELOG.md`):

```bash
python tools/changelog/sync.py           # regenera js/releases.js y la versión de los footers
python tools/changelog/sync.py --check   # falla si el sitio quedó desfasado
```

Agregá el resumen bilingüe de la versión en `tools/changelog/i18n.json`; si falta, se publica el
texto en inglés del CHANGELOG para ambos idiomas y el script lo avisa. `tools/showcase/publish.py`
ejecuta `sync.py` al final.

Push directo a `main` = sitio actualizado.
