# Recursos procesados

Colocar aquí imágenes aprobadas para importarlas mediante `astro:assets` y generar tamaños responsive con `<Image />` o `<Picture />`.

Las 55 fotografías del cliente ya cuentan con derivados responsive preprocesados en `public/images/projects/` y se usan con `src/components/ui/ProjectImage.astro`. No recomprimir esos derivados con Astro. Catálogo y guía: `docs/images.md`.

- Hero/LCP: dimensiones explícitas, carga eager y prioridad alta solo para la imagen principal.
- Resto: lazy loading, dimensiones explícitas y `sizes` realista.
- Originales del cliente permanecen intactos en `Contenido Web/` y `Logo/`; no se publican automáticamente.
- No usar el PDF interno en `public/`.
