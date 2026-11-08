# Cross Pro Services

Entorno inicial con Astro, MDX, TypeScript estricto y GSAP. Sitio estático de cinco páginas; no incluye todavía diseño final ni formulario operativo.

## Desarrollo

Requiere Node.js 24 LTS y npm.

```bash
npm ci
npm run dev
```

Abrir `http://localhost:4321`.

## Comandos

```bash
npm run check          # Astro + TypeScript
npm run format         # Formatear
npm run build          # Generar dist/
npm run preview        # Revisar build local
npx playwright install chromium
npm run test:e2e       # Desktop, móvil, sin JS y animaciones
npm run validate      # Comprobación completa
```

## Organización

```text
src/
  assets/              Imágenes aprobadas y optimizadas por Astro
  components/
    content/           Renderizado de contenido
    layout/            Header y footer
    ui/                Primitivas reutilizables
  config/              Configuración del sitio
  content/pages/       Textos MDX
  layouts/             Documento HTML y metadatos
  pages/               Rutas explícitas
  scripts/             Movimiento progresivo GSAP
  styles/              Tokens, base y utilidades CSS
  content.config.ts    Esquema del contenido
public/                Recursos sin procesamiento
docs/                  Arquitectura y pendientes
tests/e2e/             Pruebas de navegador
.agents/skills/        Skill propia + Astro y ocho skills oficiales GSAP
```

Ver `docs/architecture.md` para criterios de rendimiento y pendientes antes de publicar. Los materiales originales quedan intactos y fuera del build público. El sitio está marcado `noindex` durante esta fase.

## Fotografías

La fuente vigente es `Contenido Web/fixed/`: sus **54 fotos corregidas se usan todas**, distribuidas en 24 grupos compartidos entre Home y Our Work. Se generan WebP/JPEG responsive y miniaturas de 240 px, con URLs versionadas por hash. `scripts/fixed-photo-sources.json` enumera todos los archivos activos y `scripts/project-groups.json` define sus agrupaciones, títulos y descripciones. La entrega original de 55 fotos se conserva archivada, sin utilizarla como respaldo visual. Ver `docs/images.md` para trazabilidad y pruebas.

El repositorio incluye los derivados web, pero no las fuentes de `Contenido Web/`, el logo fuente de `Logo/` ni el PDF interno. `npm run build` funciona sin esos materiales. Para regenerar fotos se necesita `Contenido Web/fixed/`; para verificar la conservación de ambas entregas mediante `npm run test:assets` (incluida en `npm run validate`), también se necesita `Contenido Web/Fotos/`.

```bash
npm run photos:prepare # Regenerar derivados desde fixed, sin exclusiones
npm run test:assets   # Verificar archivos, tamaños y hashes
```

## Favicon

Se utiliza el logo PNG oficial **completo y transparente**, con símbolo y todos sus textos, sin recortes ni fondo añadido. Se sirve como ICO (16/32/48 px), PNG de 32 px y Apple touch icon de 180 px en las cinco páginas. Los enlaces incluyen una versión para invalidar la caché del favicon anterior. Regenerar con `npm run icons:prepare`; para regenerarlo y verificar sus píxeles se necesita el PNG fuente local `Logo/png_logo_on_a_transparent_checkerboard_background.png`, que se conserva intacto y fuera de Git.
