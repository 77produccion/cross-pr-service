# Arquitectura y rendimiento

## Base

HTML pre-renderizado en build, sin servidor de aplicación ni React. MDX en colección tipada y rutas explícitas: `/`, `/services/`, `/about-us/`, `/our-work/`, `/contact/`.

Las cinco páginas adoptan la línea visual de `cross-pro-web-linea-propuesta/index.html`, depurada según `docs/visual-audit.md`: internas oscuras y fotográficas, Home con menos ornamentos y selección de acabados terminados. Ver `docs/proposal-design.md` para el traslado original. No está lista para publicación hasta verificar contacto y aprobar contenido.

## Movimiento

`data-reveal` activa la animación de entrada. GSAP y ScrollTrigger se importan dinámicamente y las animaciones están siempre activas por decisión del cliente, sin selector de movimiento. Se animan transformaciones/opacidad, nunca se ocultan H1 ni foto base LCP. El hero funde seis vistas seleccionadas, cargando una nueva por vez; las tarjetas de servicio revelan sus descripciones con hover/foco CSS, siempre visibles en táctil. Scroll nativo, carrusel manual sin pinning ni scroll secuestrado. `matchMedia().revert()` elimina estilos y triggers propios; también se limpian los listeners locales.

Las ocho skills instaladas son documentación, no ocho paquetes JavaScript enviados al navegador.

## Objetivos a medir sobre el diseño final

- LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms como objetivos de Core Web Vitals, no resultados garantizados.
- Medir Lighthouse móvil en producción y comprobar en dispositivo real de gama media.
- Servir WebP responsive con respaldo JPEG; evaluar AVIF si una medición posterior justifica más variantes. No servir los originales del cliente directamente.
- Playfair Display y DM Sans se sirven como WOFF2 locales con `font-display: swap`; no se carga Google Fonts en runtime. Las fuentes de direcciones anteriores se conservan pero no se solicitan.
- Revisar tamaño comprimido de JS/CSS tras cada incorporación importante.

## Pendientes de publicación

- Confirmar nombre comercial, logo aprobado, colores, dominio y datos de contacto.
- Seleccionar fotos reales y confirmar categorías/ubicaciones y posibles pares antes/después.
- Completar diseño y copys de las cinco páginas con CTA por bloque.
- El formulario prepara un mensaje para WhatsApp, sin simular recepción. Queda pendiente implementar entrega por correo con antispam, proveedor y pruebas de recepción.
- Configurar dominio, canonical, sitemap, robots, políticas y hosting/caché al conocer despliegue.
- Quitar `site.noindex` solo al aprobar publicación.

Los originales se conservan intactos fuera de `public`. Cuando se entregan fuentes en una ruta pública, se archivan en `Contenido Web/` verificando sus bytes y se publican únicamente derivados optimizados. El par exterior aprobado y su conversión se documentan en `docs/images.md`.
