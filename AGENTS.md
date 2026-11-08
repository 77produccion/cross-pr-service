# Cross Pro Services

## Alcance

Astro estático + MDX + TypeScript estricto + GSAP. Usar npm y conservar package-lock.json.
El PDF es fuente de contenido, pero la instrucción del usuario reemplaza WordPress por Astro.

## Estructura

- `src/pages/`: cinco rutas explícitas. No crear subpáginas por servicio ni blog.
- `src/content/pages/`: textos MDX validados mediante `src/content.config.ts`.
- `src/layouts/`, `src/components/{layout,ui,content}/`: presentación reutilizable.
- `src/config/`: configuración central y datos verificados.
- `src/scripts/`: mejoras progresivas; `motion.ts` administra GSAP.
- `src/assets/`: imágenes aprobadas procesadas por Astro.
- `public/`: archivos públicos sin procesamiento. Nunca brief ni originales internos.
- `public/images/projects/`: excepción intencional: derivados WebP/JPEG ya procesados por `scripts/prepare-photos.mjs`. Usar `ProjectImage.astro`, sin recomprimirlos. Ver `docs/images.md`.
- `docs/`: decisiones, rendimiento y pendientes.
- `tests/e2e/`: pruebas contra build de producción.

## Skills

Consultar `.agents/skills/cross-pro-development/SKILL.md` para reglas propias.
Las ocho skills oficiales GSAP están en `.agents/skills/gsap-*`.
Usar solo las relevantes; `gsap-react` no implica instalar React.
`astro-developer` oficial describe el monorepo de Astro: sus comandos internos no corresponden a este sitio.

## Calidad

Ejecutar `npm run validate` antes de entregar. No prometer puntuaciones Lighthouse ni FPS sin medir.
HTML legible sin JavaScript; no ocultar H1/LCP para animar. Cargar GSAP/plugins bajo demanda.
Animaciones siempre activas por decisión del cliente: no añadir selector para desactivarlas. Revertir animaciones en cambios de página. No secuestrar scroll.
No inventar contacto, reseñas, licencias, pares antes/después ni estimados gratuitos. No publicar Roofing.
Conservar materiales originales. Estado inicial noindex hasta aprobación de contenido y dominio.
