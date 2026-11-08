# Dirección A — Taller editorial (respaldo)

Respaldo de la Home de la dirección A para poder restaurarla si las direcciones B o C no se aprueban.

## Cómo restaurar A

1. Copiar de vuelta a `src/components/content/` y quitar la extensión `.txt`:
   - `Home.astro.txt` → `Home.astro`
   - `HomeServices.astro.txt` → `HomeServices.astro`
   - `HomeWork.astro.txt` → `HomeWork.astro`
2. En `src/styles/global.css`, los estilos de A siguen presentes y empiezan en el bloque comentado `Direction A — Taller editorial`. No es necesario reescribirlos.
3. En `ContentPage.astro`, cambiar la clase de Home a `home-a` (o quitar la clase). No usar `home`, porque activaría los estilos de B.
4. Eliminar o dejar sin uso el bloque `Direction B — Contraste de obra`, que está limitado a `body.page-home`.
5. Ejecutar `npm run validate`.

Las fuentes Archivo y DM Sans ya están en `src/assets/fonts/` y se mantienen para A y para las páginas internas.
