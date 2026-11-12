let cleanup: (() => void)[] = [];

export function initComparisons() {
  cleanup.forEach((dispose) => dispose());
  cleanup = [];
  document
    .querySelectorAll<HTMLElement>('[data-comparison]')
    .forEach((comparison) => {
      const range =
        comparison.querySelector<HTMLInputElement>('.comparison-range');
      const handle =
        comparison.querySelector<HTMLElement>('.comparison-handle');
      const instructions = document.getElementById(
        range?.getAttribute('aria-describedby') ?? '',
      );
      if (!range || !handle) return;
      const update = () => {
        const value = Math.max(0, Math.min(100, Number(range.value)));
        comparison.style.setProperty('--comparison-position', `${value}%`);
        range.setAttribute(
          'aria-valuetext',
          `${value}% before, ${100 - value}% after`,
        );
      };
      range.addEventListener('input', update);
      update();
      range.hidden = false;
      handle.hidden = false;
      if (instructions) instructions.hidden = false;
      comparison.classList.add('is-ready');
      cleanup.push(() => {
        range.removeEventListener('input', update);
        comparison.classList.remove('is-ready');
        comparison.style.removeProperty('--comparison-position');
        range.hidden = true;
        handle.hidden = true;
        if (instructions) instructions.hidden = true;
      });
    });
}

document.addEventListener('astro:before-swap', () => {
  cleanup.forEach((dispose) => dispose());
  cleanup = [];
});
