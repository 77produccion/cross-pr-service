# Dirección B — Contraste de obra (respaldo)

Respaldo de la Home de la dirección B para poder restaurarla si la dirección C no se aprueba.

## Cómo restaurar B

1. Copiar de vuelta a `src/components/content/` y quitar la extensión `.txt`:
   - `Home.astro.txt` → `Home.astro`
   - `HomeServices.astro.txt` → `HomeServices.astro`
   - `HomeWork.astro.txt` → `HomeWork.astro`
2. En `ContentPage.astro`, cambiar la clase de Home de `home-c` a `home`.
3. Los estilos de B siguen presentes en `src/styles/global.css` dentro del bloque comentado `Direction B — Contraste de obra (solo Home)`, limitados a `body.page-home`.
4. Ejecutar `npm run validate`.

La fuente Anton ya está en `src/assets/fonts/`.
