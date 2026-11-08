---
name: cross-pro-development
description: Convenciones propias para desarrollar Cross Pro Services con Astro, MDX y GSAP; estructura, contenido, accesibilidad y rendimiento.
---

# Cross Pro: desarrollo

1. Revisar `AGENTS.md`, `docs/architecture.md` y el brief antes de modificar contenido comercial.
2. Preferir componentes Astro y HTML estático; MDX para contenido y TypeScript para comportamiento.
3. No añadir framework cliente, dependencias de scroll ni plugins GSAP sin una necesidad concreta.
4. Usar `astro:assets` para imágenes, `sizes` según layout y dimensiones para evitar CLS. Nunca lazy-load del LCP.
5. Mantener contenido visible sin JS. Animar transform/opacity, no dimensiones; usar `gsap.matchMedia()` y cleanup local.
6. Consultar las skills oficiales GSAP pertinentes antes de implementar cada tipo de animación.
7. Separar decisiones de diseño final del scaffold técnico. No inventar datos pendientes.
8. Ejecutar `npm run validate`; documentar pruebas que no se hayan podido ejecutar.
