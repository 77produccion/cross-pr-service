# Línea gráfica de la propuesta

La evolución posterior se recoge en `docs/visual-audit.md`: simplificación del Home, hero con seis acabados seleccionados y rediseño oscuro de las cuatro internas. Las notas siguientes documentan el traslado inicial.

Se traslada `cross-pro-web-linea-propuesta/index.html` a componentes Astro, manteniendo intacta la carpeta original. El sitio conserva sus cinco rutas, MDX, fotos reales responsive, filtros y visor de proyectos.

## Diseño

- Tokens originales carbón, crema, dorados y verde; Playfair Display 500 (normal e itálica), DM Sans y Manrope locales.
- Hero de altura completa con la van, degradado, marco interior, cifras y CTA; cinta de servicios, tres tarjetas fotográficas, dos fotos de chimenea superpuestas, carrusel horizontal, cobertura y formulario.
- Cabecera transparente en Home y sólida en las internas, compacta al desplazarse. Menú móvil con cierre mediante Escape y navegación disponible sin JavaScript.
- Internas con encabezado oscuro corto, títulos serif y los mismos botones y componentes de marca.
- GSAP y ScrollTrigger bajo demanda para entradas por transformación, zoom de entrada del hero y progreso. Sin pinning ni conversión del scroll vertical en horizontal. Se revierte al salir de página.

## Adaptaciones deliberadas

- No se copian fotos de respaldo generadas con IA. `ProjectImage.astro` reutiliza los derivados reales existentes, sin recomprimirlos.
- El comparador antes/después se incorporó tras la entrega explícita de `exterior-1.png` y `exterior-2.png` por el cliente. Usa el exterior real, con proporción completa 4:3, rango accesible y ambas fotos visibles sin JavaScript. Las fotos de chimenea siguen como detalles del proyecto, no como una comparación certificada.
- El hero alterna la van y las dos nuevas fotos exteriores mediante cross-fade; se conservan los originales y se sirven AVIF/WebP/JPEG responsive. Ver `docs/images.md` para las mediciones.
- Se conservan los textos comerciales verificados en lugar de introducir promesas de durabilidad, procesos, visitas, plazos o estimados gratuitos sin confirmar.
- El número configurado está validado como WhatsApp; no se convierte en teléfono de llamadas sin confirmar ese canal.
- Formulario compartido en Home y Contact: validación nativa, servicio preseleccionado desde Services, mensaje codificado y navegación a WhatsApp. El visitante revisa y envía el mensaje allí. No hay backend, persistencia, envío automático ni confirmación ficticia. Sin JavaScript queda disponible el enlace directo.
- La entrega por correo corporativo con antispam sigue pendiente. Se mantiene `noindex` hasta aprobación final.

## Comprobación

`npm run validate` ejecuta tipos, formato, integridad de assets, build y Playwright en escritorio y móvil. Las pruebas de diseño anteriores se adaptan a la nueva composición; se conservan las de galerías y fotografías corregidas. No se afirman métricas Lighthouse sin medir.
