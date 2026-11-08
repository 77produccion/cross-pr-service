# Versión 1 — lectura del brief y decisiones

## Fuente y alcance

Revisadas las nueve páginas de `Cross_Pro_Services_Brief_Web_Diseno_y_Copys_Actualizado.pdf` (versión 2.0). Se sustituye WordPress por Astro según la instrucción del proyecto. Web comercial en inglés estadounidense, con cinco rutas y sin blog, subpáginas de servicios, precios ni Roofing.

| Ruta         | Estructura V1                                                                                               |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| `/`          | Hero, tres servicios destacados, experiencia, tres fotos, cobertura y cierre. CTA en cada bloque comercial. |
| `/services/` | Seis servicios, fotografía, descripción y CTA individual hacia Contact.                                     |
| `/about-us/` | Maurilio Jiménez, más de diez años de experiencia y compromiso con la calidad.                              |
| `/our-work/` | Seis fotos entregadas, filtros por contenido visual y visor accesible mediante diálogo nativo.              |
| `/contact/`  | Los seis campos del brief y aviso explícito de formulario todavía no operativo.                             |

## Dirección visual para iterar

Home sigue una dirección de “taller editorial”: marfil cálido, carbón, verde oliva y terracota; Archivo para titulares y DM Sans para texto, ambas servidas localmente; hero a sangre, servicios en paneles apilados, proyectos en retícula asimétrica y área de servicio tipográfica. Sin numeración decorativa ni flechas de plantilla. No se considera branding aprobado. Fotografías del catálogo existente mediante `ProjectImage.astro`, sin segunda compresión. Selección provisional, sin atribuir localidades ni pares antes/después. El hero usa la foto interior de mayor resolución, no una imagen pequeña de WhatsApp. Los originales y el PDF no se publican.

## Comportamiento y animación

Astro genera HTML estático, pero la experiencia es interactiva: filtros, visor de fotos, preselección del servicio, entradas al scroll, parallax moderado en escritorio, hover de tarjetas y progreso de lectura. Scroll nativo, sin bloqueos ni pantallas de carga. H1 y foto LCP nunca se ocultan. GSAP y ScrollTrigger se cargan bajo demanda; contextos, eventos y estilos se revierten al salir o cambiar de preferencia.

Las animaciones están siempre activas por decisión del cliente: no hay selector de movimiento ni opción para desactivarlas. Menú, contenido, enlaces e imágenes siguen funcionando sin JavaScript. Sin JS, las fotos abren su archivo directamente y la galería muestra todo.

## Datos que faltan para publicar

- Aprobación del nombre comercial y logo: el brief deja pendiente Cross Pro Services frente a CrossPR Services.
- Teléfono empresarial, correo corporativo, WhatsApp y dominio final.
- Aprobación de selección de fotos y alcance específico de drywall, cabinets y remodeling.
- Confirmar si las cotizaciones son gratuitas. La V1 solo dice “Request an Estimate”.
- Proveedor de formulario, antispam, política de privacidad y prueba real de recepción. El botón está deshabilitado; no se transmite ni almacena información.
- Testimonios verificables si se desea esa sección. No hay reseñas ficticias.
- Publicación sigue bloqueada para indexación mediante `noindex` hasta aprobación.

No se garantizan resultados Lighthouse, Core Web Vitals ni FPS sin medición en el despliegue final.

## Verificación V1

### Continuación de construcción

Las internas comparten una cabecera editorial y enlace de regreso a Home. Services incluye un índice de seis anclas y bloques alternados con fotografía responsive, descripción y CTA individual, sin nuevas rutas. Contact incorpora un bloque visual de cobertura sin inventar canales de contacto. El visor de Our Work permite avanzar y retroceder con botones o flechas del teclado, recorre únicamente la selección filtrada y desactiva los controles cuando hay una sola foto. No precarga las imágenes grandes de toda la galería.

Se añaden pruebas para navegación por anclas con y sin JavaScript, recorrido del visor filtrado y controles deshabilitados con una sola imagen. La validación de esta iteración comprende 28 pruebas E2E y tres pruebas de integridad de imágenes.

`npm run validate`: Astro/TypeScript sin errores ni avisos, formato correcto, tres pruebas de integridad de imágenes y 22 pruebas E2E aprobadas en Chromium escritorio/móvil. Se comprueban rutas, ausencia de desbordamiento horizontal, contenido sin JS, movimiento reducido, selección persistente de animaciones, galería, cierre con Escape, retorno de foco y formulario no operativo. Revisión visual adicional del Home en 1440 y 390 px. Esto no sustituye una auditoría WCAG ni pruebas en Safari/iOS real.
