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

55 originales catalogados con nombres descriptivos e IDs estables, derivados WebP/JPEG responsive y componente `ProjectImage.astro`. Ver `docs/images.md` y `docs/assets/photo-catalog.csv` para trazabilidad.

El repositorio incluye los derivados web, pero no los originales de `Contenido Web/`, el logo fuente de `Logo/` ni el PDF interno. `npm run build` funciona sin esos materiales. Para regenerar fotos o ejecutar la verificación de hashes de originales de `npm run test:assets` (incluida en `npm run validate`), es necesario disponer de la carpeta original local.

```bash
npm run photos:prepare # Regenerar derivados desde originales
npm run test:assets   # Verificar archivos, tamaños y hashes
```
