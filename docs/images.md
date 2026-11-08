# Fotografías: nombres, formatos y uso responsive

## Organización

- Originales intactos: `Contenido Web/Fotos/`.
- Definiciones revisadas visualmente: `scripts/photo-sources.json`. El orden define IDs estables: añadir al final; nunca reordenar.
- Archivos web: `public/images/projects/cps-NNN/`.
- Catálogo de uso: `src/data/photos.json`.
- Trazabilidad privada: `docs/assets/photo-catalog.json` y `photo-catalog.csv` (Excel). Incluyen original, SHA-256, dimensiones, pesos y observaciones.

Ejemplo: `cps-022-kitchen-white-cabinets-768w.webp`.

No se atribuyen ciudades, fechas de obra, aprobación ni pares antes/después sin confirmación. Todas las fotos siguen pendientes de aprobación para publicación. Revisar las observaciones de capturas con marcas incrustadas y trabajo en cubierta.

## Conversión

```bash
npm run photos:prepare
npm run test:assets
```

Cada derivado parte directamente del original, no de otro WebP, para evitar compresión acumulada. Orientación EXIF aplicada, salida sRGB, EXIF/GPS eliminado. No se hacen recortes, retoques ni ampliaciones.

WebP calidad 82 y JPEG progresivo calidad 82 de respaldo, con anchos candidatos **480, 768, 1280 y 1920 px**, limitados por la resolución original. Una foto pequeña no puede ganar detalle al ampliarla: se incluye su ancho nativo y se deben evitar hero/fullscreen si no tiene resolución suficiente.

Los dispositivos no requieren formatos diferentes: `<picture>` elige WebP o JPEG según compatibilidad y `srcset`/`sizes` elige resolución según ancho de diseño y densidad de pantalla. AVIF no se añade por ahora: WebP + JPEG mantiene amplia compatibilidad con menos variantes.

Los derivados se generan explícitamente para que sean inspeccionables y reutilizables; no volver a comprimirlos con `astro:assets`. Aunque todos estén en el despliegue, el navegador descarga únicamente el candidato elegido por cada imagen usada. No precargar toda la galería.

## Componente

```astro
---
import ProjectImage from '@/components/ui/ProjectImage.astro';
---

<!-- Tarjeta: una columna móvil, dos tablet, tres desktop. Ajustar al layout real. -->
<ProjectImage
  id="cps-022"
  sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc((100vw - 64px) / 2), 384px"
/>

<!-- Solo para la imagen principal visible al cargar: -->
<ProjectImage id="cps-024" sizes="(max-width: 1200px) 100vw, 1200px" priority />
```

Dimensiones explícitas para reducir CLS, lazy loading por defecto y sin JavaScript. `priority` activa eager/high solo para LCP. Los ALT iniciales son descripciones visuales en inglés y pueden ajustarse al contexto; usar `alt=""` para imágenes decorativas.

Las pruebas comprueban decodificación, dimensiones, formatos, respaldo JPEG, ausencia de EXIF y correspondencia SHA-256 con originales. La calidad visual y la selección comercial requieren revisión humana antes de publicar.
