# Arquitectura y rendimiento

## Base

HTML pre-renderizado en build, sin servidor de aplicación ni React. MDX en colección tipada y rutas explícitas: `/`, `/services/`, `/about-us/`, `/our-work/`, `/contact/`.

La V1 desarrolla las cinco páginas con una dirección visual provisional basada en el logo, fotografías del material entregado e interacciones progresivas. Ver `docs/version-1.md` para el mapa de contenido y los pendientes. No está lista para publicación hasta verificar contacto y aprobar contenido.

## Movimiento

`data-reveal` activa la animación de entrada. GSAP y ScrollTrigger se importan dinámicamente y las animaciones están siempre activas por decisión del cliente, sin selector de movimiento. Se animan transformaciones, nunca se ocultan H1 ni LCP. Entradas al scroll, hover y parallax moderado de una foto en escritorio. Scroll nativo, sin loops ni scroll secuestrado. `matchMedia().revert()` elimina estilos y triggers propios; también se limpian los listeners locales.

Las ocho skills instaladas son documentación, no ocho paquetes JavaScript enviados al navegador.

## Objetivos a medir sobre el diseño final

- LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms como objetivos de Core Web Vitals, no resultados garantizados.
- Medir Lighthouse móvil en producción y comprobar en dispositivo real de gama media.
- Servir WebP responsive con respaldo JPEG; evaluar AVIF si una medición posterior justifica más variantes. No servir los originales del cliente directamente.
- Archivo y DM Sans se sirven como WOFF2 locales con `font-display: swap`; no se carga Google Fonts en runtime.
- Revisar tamaño comprimido de JS/CSS tras cada incorporación importante.

## Pendientes de publicación

- Confirmar nombre comercial, logo aprobado, colores, dominio y datos de contacto.
- Seleccionar fotos reales y confirmar categorías/ubicaciones y posibles pares antes/después.
- Completar diseño y copys de las cinco páginas con CTA por bloque.
- Implementar formulario real con antispam, proveedor y pruebas de recepción. No simular éxito.
- Configurar dominio, canonical, sitemap, robots, políticas y hosting/caché al conocer despliegue.
- Quitar `site.noindex` solo al aprobar publicación.

Los originales permanecen en sus carpetas actuales. No se mueven, borran ni copian al sitio público.
