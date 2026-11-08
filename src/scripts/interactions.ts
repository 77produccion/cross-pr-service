/** Native links/dialog stay usable without an animation dependency. */
let cleanupHeader: (() => void) | undefined;
let cleanupShowcases: (() => void)[] = [];

function initInteractions() {
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
  document
    .querySelectorAll<HTMLElement>('[data-gallery]')
    .forEach((gallery) => {
      if (gallery.dataset.ready) return;
      gallery.dataset.ready = 'true';
      const filters = gallery.querySelector<HTMLElement>('.gallery-filters');
      if (filters) filters.hidden = false;
      const dialog = gallery.querySelector<HTMLDialogElement>('dialog');
      const image = dialog?.querySelector('img');
      const caption = dialog?.querySelector('p');
      const links = Array.from(
        gallery.querySelectorAll<HTMLAnchorElement>('[data-project-image]'),
      );
      let activeLink: HTMLAnchorElement | undefined;
      const visibleLinks = () =>
        links.filter(
          (link) => !link.closest<HTMLElement>('[data-category]')?.hidden,
        );
      const showPhoto = (link: HTMLAnchorElement) => {
        if (!image || !caption) return;
        activeLink = link;
        image.src = link.href;
        image.alt = link.dataset.alt ?? '';
        caption.textContent = link.dataset.title ?? '';
        const visible = visibleLinks();
        const position = dialog?.querySelector('[data-photo-position]');
        if (position)
          position.textContent = `${visible.indexOf(link) + 1} / ${visible.length}`;
        dialog
          ?.querySelectorAll<HTMLButtonElement>(
            '[data-previous-photo], [data-next-photo]',
          )
          .forEach((button) => {
            button.disabled = visible.length < 2;
          });
      };
      const movePhoto = (direction: number) => {
        const visible = visibleLinks();
        if (!activeLink || visible.length < 2) return;
        const next =
          visible[
            (visible.indexOf(activeLink) + direction + visible.length) %
              visible.length
          ];
        if (next) showPhoto(next);
      };
      gallery
        .querySelectorAll<HTMLButtonElement>('[data-filter]')
        .forEach((button) => {
          button.addEventListener('click', () => {
            let count = 0;
            gallery
              .querySelectorAll<HTMLButtonElement>('[data-filter]')
              .forEach((item) =>
                item.setAttribute('aria-pressed', String(item === button)),
              );
            gallery
              .querySelectorAll<HTMLElement>('[data-category]')
              .forEach((card) => {
                card.hidden =
                  button.dataset.filter !== 'All' &&
                  card.dataset.category !== button.dataset.filter;
                if (!card.hidden) count++;
              });
            const status = gallery.querySelector('.gallery-status');
            if (status) status.textContent = `${count} projects`;
            document.dispatchEvent(new Event('gallery:filter'));
          });
        });
      links.forEach((link) => {
        link.addEventListener('click', (event) => {
          if (
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            !dialog ||
            !image ||
            !caption
          )
            return;
          event.preventDefault();
          showPhoto(link);
          dialog.showModal();
        });
      });
      dialog
        ?.querySelector('.lightbox-close')
        ?.addEventListener('click', () => dialog.close());
      dialog
        ?.querySelector('[data-previous-photo]')
        ?.addEventListener('click', () => movePhoto(-1));
      dialog
        ?.querySelector('[data-next-photo]')
        ?.addEventListener('click', () => movePhoto(1));
      dialog?.addEventListener('keydown', (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          movePhoto(event.key === 'ArrowRight' ? 1 : -1);
        }
      });
      dialog?.addEventListener('click', (event) => {
        if (event.target === dialog) {
          const rect = dialog.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            dialog.close();
        }
      });
    });
  const form = document.querySelector<HTMLFormElement>('.contact-form');
  // Defence in depth: this preview has no endpoint and never transmits personal data.
  form?.addEventListener('submit', (event) => event.preventDefault());
  const service = new URLSearchParams(window.location.search).get('service');
  const select = form?.querySelector<HTMLSelectElement>('[name="projectType"]');
  if (
    select &&
    service &&
    Array.from(select.options).some((option) => option.value === service)
  )
    select.value = service;
}
initInteractions();
document.addEventListener('astro:page-load', initInteractions);
document.addEventListener('astro:before-swap', () => {
  cleanupHeader?.();
  cleanupShowcases.forEach((cleanup) => cleanup());
  cleanupShowcases = [];
});
