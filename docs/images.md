# Fotografías: nombres, formatos y uso responsive

## Organización

- Entrega original intacta: `Contenido Web/Fotos/`, archivada con sus 55 hashes en `docs/assets/original-photo-checksums.json`.
- Fuente vigente y exclusiva: `Contenido Web/fixed/`, con los 54 archivos corregidos por el cliente. Se trasladó la carpeta completa desde `public/images/fixed/` sin modificar los archivos, para no servir JPG fuente pesados.
- Copias organizadas por el cliente: `Contenido Web/Proyectos/`. Se conservaron los nombres y archivos de sus carpetas; se retiraron de `public/images/` después de verificar sus SHA-256 contra los originales, sin borrar ni modificar las imágenes.
- Archivos activos e IDs estables: `scripts/fixed-photo-sources.json`. Debe enumerar cada archivo de `fixed` exactamente una vez. `scripts/photo-sources.json` conserva los IDs, slugs y textos descriptivos históricos; no se renumera ni se reutiliza material antiguo si falta su versión corregida.
- Proyectos y fotos relacionadas: `scripts/project-groups.json`. Es la fuente común para las rutas y la galería. Los 54 IDs activos deben aparecer exactamente una vez, sin fotos retenidas ni grupos ocultos.
- Archivos web: `public/images/projects/<project-slug>/`. Los IDs `cps-NNN` siguen estables, pero los directorios ahora identifican el proyecto.
- Catálogo de uso: `src/data/photos.json`.
- Trazabilidad privada: `docs/assets/photo-catalog.json` y `photo-catalog.csv` (Excel). Incluyen original, SHA-256, dimensiones, pesos y observaciones.

Ejemplo de nombre: `public/images/projects/kitchen-cabinets/cps-022-kitchen-white-cabinets-fixed-<sha256-8>-768w.webp`. El hash de la fuente corregida evita que el navegador o CDN reutilice la foto anterior. No se renombran los archivos fuente: los nombres públicos son descriptivos, en inglés, con guiones y sin espacios ni acentos.

El cliente ha indicado utilizar todas las fotos corregidas de `fixed`, sin exclusiones. Esto no añade servicios activos: no se publica Roofing ni se atribuyen ciudades, fechas, técnicas o pares antes/después sin confirmación. El estado noindex del sitio se mantiene hasta aprobar contenido y dominio.

## Conversión

```bash
npm run photos:prepare
npm run test:assets
```

Cada derivado parte directamente de su archivo corregido de `fixed`, no de la entrega antigua ni de otro WebP. Orientación EXIF aplicada, salida sRGB, EXIF/GPS eliminado. Se conservan el encuadre y los retoques entregados por el cliente, sin nuevos recortes, retoques ni ampliaciones.

WebP calidad 78 (effort 6) y JPEG progresivo calidad 78 de respaldo, con anchos candidatos **240, 480, 768, 1280 y 1920 px**, limitados por la resolución original. 240 px se usa para miniaturas, sin descargar una foto grande por cada selector. Una foto pequeña no puede ganar detalle al ampliarla: se incluye su ancho nativo y se deben evitar hero/fullscreen si no tiene resolución suficiente.

Los dispositivos no requieren formatos diferentes: `<picture>` elige WebP o JPEG según compatibilidad y `srcset`/`sizes` elige resolución según ancho de diseño y densidad de pantalla. AVIF no se añade por ahora: WebP + JPEG mantiene amplia compatibilidad con menos variantes.

Los derivados se generan explícitamente para que sean inspeccionables y reutilizables; no volver a comprimirlos con `astro:assets`. Aunque todos estén en el despliegue, el navegador descarga únicamente el candidato elegido por cada imagen usada. No precargar toda la galería.

El script retira únicamente las variantes generadas obsoletas enumeradas en el catálogo anterior; no borra recursivamente carpetas ni toca los originales. Los WebP/JPEG existentes se regeneran desde la fuente, no desde otro derivado.

## Galería por proyecto

- 24 grupos y las 54 fotos de `fixed`, todas incluidas. Los cuatro archivos corregidos del baño sustituyen a las capturas antiguas. También se incluye la segunda vista del patio dentro de su proyecto, sin anunciar Roofing. El antiguo ID `cps-020` no existe en la selección `fixed` y no se recupera de la entrega anterior.
- Home y Our Work comparten `ProjectLightbox.astro` y `src/scripts/gallery.ts`. Abrir un proyecto solo permite recorrer sus propias fotos: miniaturas, flechas y teclas izquierda/derecha, sin saltar a otra obra.
- El visor usa `<picture>` con WebP, JPEG de respaldo y `srcset`; `sizes` considera el ancho disponible **y** el alto visible de la foto para evitar pedir una variante grande cuando la imagen está contenida en una pantalla pequeña.
- El cambio espera a la decodificación y funde dos buffers visuales; las selecciones rápidas y el cierre invalidan cargas pendientes. Solo se crean miniaturas del proyecto abierto. No se precargan fotos grandes de otros proyectos.
- Botón de cierre únicamente con ícono SVG, nombre accesible `Close photo` y área de 44 × 44 px. Escape, cierre al pulsar fuera y retorno del foco al enlace original.
- Visor adaptado a la proporción de cada foto: en escritorio la foto aprovecha hasta el 94 % del alto de pantalla y los textos/miniaturas van en un panel lateral. La anchura del modal se calcula con la proporción de la foto para evitar bandas vacías. Se conserva `object-fit: contain`, sin recortar. En móvil la imagen ocupa el ancho disponible, con alto proporcional (hasta 72svh); la información queda debajo en un área desplazable y el cierre sigue visible.
- Títulos y descripciones se limitan a lo que muestran las fotos. No se inventan ciudades, fechas, técnicas ni etiquetas de antes/después. Sin JavaScript hay enlaces nativos a todas las fotos del proyecto.

## Medición de archivos

`npm run photos:prepare` informa los bytes fuente y la suma de las variantes WebP más grandes. Los pesos de cada tamaño y formato quedan en `src/data/photos.json` y `docs/assets/photo-catalog.json`. No se comparan porcentajes con la entrega anterior como si fueran las mismas imágenes: `fixed` aporta más resolución y distinto encuadre. Son pesos de archivos, no resultados de Lighthouse ni de velocidad de conexión.

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

Las pruebas verifican que cada archivo de `fixed` aparece una vez en la galería, sin exclusiones, y que se usa su hash y no una URL antigua. También comprueban decodificación, dimensiones, formatos, ausencia de EXIF, límites de tamaño y conservación de ambas entregas fuente. Las pruebas de navegador recorren todas las fotos en escritorio y móvil.
