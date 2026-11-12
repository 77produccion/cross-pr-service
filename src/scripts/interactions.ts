/** Native links/dialog stay usable without an animation dependency. */
import { initGalleries } from './gallery';
import { initComparisons } from './comparison';

let cleanupHeader: (() => void) | undefined;
let cleanupShowcases: (() => void)[] = [];
let cleanupRequests: (() => void)[] = [];
let whatsappTimer: number | undefined;
let whatsappCollapseTimer: number | undefined;

function initInteractions() {
  cleanupRequests.forEach((dispose) => dispose());
  cleanupRequests = [];
  window.clearTimeout(whatsappTimer);
  window.clearTimeout(whatsappCollapseTimer);
  const whatsapp = document.querySelector<HTMLElement>('.whatsapp-button');
  if (whatsapp) {
    whatsappTimer = window.setTimeout(() => {
      const bounds = whatsapp.getBoundingClientRect();
      const icon = whatsapp.querySelector('svg')?.getBoundingClientRect();
      const distance = bounds.width - 56;
      whatsapp.style.setProperty('--collapse-distance', `${distance}px`);
      whatsapp.style.setProperty(
        '--icon-shift',
        `${icon ? bounds.right - 28 - icon.width / 2 - icon.left : 0}px`,
      );
      whatsapp.classList.add('is-collapsing');
      whatsappCollapseTimer = window.setTimeout(() => {
        whatsapp.classList.remove('is-collapsing');
        whatsapp.classList.add('is-compact');
        whatsapp.style.removeProperty('--collapse-distance');
        whatsapp.style.removeProperty('--icon-shift');
      }, 450);
    }, 5000);
  }
  const header = document.querySelector<HTMLElement>('.site-header');
  const toggle = header?.querySelector<HTMLButtonElement>('.menu-toggle');
  if (header && toggle && !header.classList.contains('menu-ready')) {
    const setOpen = (open: boolean) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    const onToggle = () =>
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    const onKeydown = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        toggle.getAttribute('aria-expanded') === 'true'
      ) {
        setOpen(false);
        toggle.focus();
      }
    };
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return;
      if (
        !header.contains(event.target) ||
        (event.target instanceof Element && event.target.closest('a'))
      ) {
        setOpen(false);
      }
    };
    const breakpoint = window.matchMedia('(max-width: 850px)');
    const onResize = () => setOpen(false);
    const updateHeader = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    setOpen(false);
    toggle.addEventListener('click', onToggle);
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('click', onClick);
    breakpoint.addEventListener('change', onResize);
    header.classList.add('menu-ready');
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    cleanupHeader = () => {
      toggle.removeEventListener('click', onToggle);
      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('click', onClick);
      breakpoint.removeEventListener('change', onResize);
      window.removeEventListener('scroll', updateHeader);
      setOpen(false);
      header.classList.remove('menu-ready');
    };
  }
  document
    .querySelectorAll<HTMLElement>('[data-photo-switcher]')
    .forEach((showcase) => {
      if (showcase.dataset.showcaseReady) return;
      showcase.dataset.showcaseReady = 'true';
      const links = Array.from(
        showcase.querySelectorAll<HTMLAnchorElement>('[data-showcase-select]'),
      );
      const frames = Array.from(
        showcase.querySelectorAll<HTMLElement>('[data-showcase-photo]'),
      );
      const status = showcase.querySelector<HTMLElement>(
        '[data-showcase-status]',
      );
      let selection = 0;
      const removers: (() => void)[] = [];
      links.forEach((link, index) => {
        const selectPhoto = async (event: MouseEvent) => {
          if (
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0
          )
            return;
          const frame = frames[index];
          const image = frame?.querySelector('img');
          if (!frame || !image) return;
          event.preventDefault();
          const request = ++selection;
          showcase.setAttribute('aria-busy', 'true');
          try {
            image.loading = 'eager';
            await image.decode();
            if (request !== selection || !showcase.isConnected) return;
            frames.forEach((item, itemIndex) => {
              item.classList.toggle('is-active', itemIndex === index);
              item.setAttribute('aria-hidden', String(itemIndex !== index));
            });
            links.forEach((item, itemIndex) => {
              if (itemIndex === index)
                item.setAttribute('aria-current', 'true');
              else item.removeAttribute('aria-current');
            });
            if (status)
              status.textContent = `Photo ${index + 1} of ${frames.length}: ${image.alt}`;
          } catch {
            if (request === selection && status)
              status.textContent =
                'This photo could not be loaded. Please try again.';
          } finally {
            if (request === selection) showcase.removeAttribute('aria-busy');
          }
        };
        link.addEventListener('click', selectPhoto);
        removers.push(() => link.removeEventListener('click', selectPhoto));
      });
      cleanupShowcases.push(() => {
        selection++;
        removers.forEach((remove) => remove());
        showcase.removeAttribute('aria-busy');
        delete showcase.dataset.showcaseReady;
      });
    });
  initGalleries();
  initComparisons();
  const service = new URLSearchParams(window.location.search).get('service');
  document
    .querySelectorAll<HTMLFormElement>('[data-estimate-form]')
    .forEach((form) => {
      const select = form.querySelector<HTMLSelectElement>(
        '[name="projectType"]',
      );
      const button = form.querySelector<HTMLButtonElement>('[type="submit"]');
      if (
        select &&
        service &&
        Array.from(select.options).some((option) => option.value === service)
      )
        select.value = service;
      const onSubmit = (event: SubmitEvent) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const data = new FormData(form);
        const text = `Hi Cross Pro! I'd like an estimate.\nName: ${data.get('name')}\nPhone: ${data.get('phone')}\nEmail: ${data.get('email')}\nService: ${select?.selectedOptions[0]?.textContent ?? 'Other'}\nLocation: ${data.get('location') || '-'}\nDetails: ${data.get('message') || '-'}`;
        // Navigate synchronously so no popup blocker or simulated delivery is involved.
        window.location.assign(
          `https://wa.me/${form.dataset.whatsappNumber}?text=${encodeURIComponent(text)}`,
        );
      };
      form.addEventListener('submit', onSubmit);
      if (button) button.disabled = false;
      cleanupRequests.push(() => {
        form.removeEventListener('submit', onSubmit);
        if (button) button.disabled = true;
      });
    });
  document
    .querySelectorAll<HTMLElement>('[data-project-carousel]')
    .forEach((carousel) => {
      const track = carousel.querySelector<HTMLElement>('[data-project-track]');
      const prev = carousel.querySelector<HTMLButtonElement>(
        '[data-carousel-prev]',
      );
      const next = carousel.querySelector<HTMLButtonElement>(
        '[data-carousel-next]',
      );
      const controls =
        carousel.querySelector<HTMLElement>('.carousel-controls');
      if (!track || !prev || !next || !controls) return;
      const update = () => {
        prev.disabled = track.scrollLeft <= 2;
        next.disabled =
          track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
      };
      const step = () =>
        (track.firstElementChild?.getBoundingClientRect().width ??
          track.clientWidth) + 18;
      const backward = () =>
        track.scrollBy({ left: -step(), behavior: 'smooth' });
      const forward = () =>
        track.scrollBy({ left: step(), behavior: 'smooth' });
      controls.hidden = false;
      prev.addEventListener('click', backward);
      next.addEventListener('click', forward);
      track.addEventListener('scroll', update, { passive: true });
      const observer = new ResizeObserver(update);
      observer.observe(track);
      update();
      cleanupRequests.push(() => {
        prev.removeEventListener('click', backward);
        next.removeEventListener('click', forward);
        track.removeEventListener('scroll', update);
        observer.disconnect();
        controls.hidden = true;
      });
    });
}
initInteractions();
document.addEventListener('astro:page-load', initInteractions);
document.addEventListener('astro:before-swap', () => {
  window.clearTimeout(whatsappTimer);
  window.clearTimeout(whatsappCollapseTimer);
  cleanupHeader?.();
  cleanupShowcases.forEach((cleanup) => cleanup());
  cleanupShowcases = [];
  cleanupRequests.forEach((cleanup) => cleanup());
  cleanupRequests = [];
});
