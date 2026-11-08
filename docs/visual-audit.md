# Auditoría visual responsive — noviembre 2026

- Hero editorial: foto a todo el alto y hasta el borde derecho en escritorio, con degradado hacia el texto. En móvil se mantiene la foto breve sobre el texto. Sin etiquetas de ubicación; la cobertura sigue en el H1 accesible y en la sección de servicio. Se alternan seis fotos existentes cada tres segundos con fundido de 0,8 s; la primera permanece visible sin JavaScript. Las restantes se preparan tras cargar GSAP y el ciclo se limpia al cambiar de página.
- Menú móvil a la izquierda, tres líneas con transición a cierre y aparición animada del panel. Se cierra con Escape, al navegar, al pulsar fuera o al cambiar de breakpoint. Sin JavaScript los enlaces permanecen visibles.
- Servicios: se conserva la fotografía sticky con cambios al scroll en escritorio; hasta 900 px cada servicio muestra su propia foto seguida de título, descripción y CTA, sin una imagen compartida que desaparezca.
- Proyectos: se elimina el escalonado; las fotos tienen una altura común limitada por el viewport para dejar visibles los pies durante el recorrido horizontal. Se anticipa la carga de las fotos al acercarse a la sección.
- Footer: logo oficial procesado por Astro, fondo carbón y texto claro. El nombre comercial encabeza los títulos de pestaña.
- Bloque de experiencia: cuatro vistas de chimenea/estanterías, miniaturas clicables en el espacio izquierdo de escritorio y bajo la foto en móvil. La selección espera a decodificar la imagen, conserva la anterior mientras carga y aplica un fundido CSS de 0,65 s. Enlaces nativos sin JavaScript, uso con teclado y estado de selección accesible. No se etiquetan como antes/después ni se atribuye una ubicación.
- CTA final compartido: foto de exterior `cps-030` en Home, cocina `cps-022` en Services, interior `cps-007` en About Us y exterior azul `cps-036` en Our Work. Degradado oscuro, texto y botón a la izquierda, esquinas redondeadas y zoom de la imagen al hover/foco en escritorio. Las fotos se asignan en `src/config/projects.ts`; Contact mantiene su formulario, sin un CTA redundante.
- Our Work amplía su selección de 6 a 12 fotos: interiores, gabinetes y exteriores. Se incorporan imágenes disponibles sin forzar las 55 en el Home; siguen fuera las capturas con marcas incrustadas y el trabajo de cubierta no aprobado.
- Se mantienen las cinco rutas, el estado noindex y los pendientes de contacto/publicación.

## Verificación

Pruebas Playwright añadidas para menú y teclado, altura del hero móvil, foto por servicio, logo del footer, título SEO y alineación/pies de la galería pinned en escritorio. Comprobación visual con Chromium a 390 × 844 y 1440 × 900; la prueba de alineación usa 1920 × 900. Esto no sustituye una revisión en dispositivos físicos ni una medición Lighthouse.
