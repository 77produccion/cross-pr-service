interface PhotoVariant {
  src: string;
  width: number;
  format: string;
}

interface GalleryPhoto {
  id: string;
  alt: string;
  width: number;
  height: number;
  variants: PhotoVariant[];
}

interface GalleryProject {
  id: string;
  title: string;
  description: string;
  photos: GalleryPhoto[];
}

const cleanups: (() => void)[] = [];

export function initGalleries() {
  document
    .querySelectorAll<HTMLElement>('[data-gallery]')
    .forEach((gallery) => {
      if (gallery.dataset.ready) return;
      const data = gallery.querySelector(
        '[data-gallery-projects]',
      )?.textContent;
      const dialog = gallery.querySelector<HTMLDialogElement>('dialog');
      if (!data || !dialog) return;
      let projects: GalleryProject[];
      try {
        projects = JSON.parse(data);
      } catch {
        return; // Native photo links remain available if enhancement fails.
      }
      const frames = Array.from(
        dialog.querySelectorAll<HTMLElement>('.lightbox-frame'),
      );
      const stage = dialog.querySelector<HTMLElement>('.lightbox-stage')!;
      const thumbnails = dialog.querySelector<HTMLElement>(
        '.lightbox-thumbnails',
      )!;
      const caption = dialog.querySelector<HTMLElement>('.lightbox-caption')!;
      const position = dialog.querySelector<HTMLElement>(
        '[data-photo-position]',
      )!;
      const status = dialog.querySelector<HTMLElement>('[data-photo-status]')!;
      const controls = dialog.querySelectorAll<HTMLButtonElement>(
        '[data-previous-photo], [data-next-photo]',
      );
      const controller = new AbortController();
      const options = { signal: controller.signal };
      let activeProject: GalleryProject | undefined;
      let opener: HTMLAnchorElement | undefined;
      let activeIndex = 0;
      let buffer = 0;
      let request = 0;

      const setSizes = (frame: HTMLElement, photo: GalleryPhoto) => {
        const width = Math.min(
          stage.clientWidth,
          (stage.clientHeight * photo.width) / photo.height,
        );
        const sizes = `${Math.max(1, Math.ceil(width))}px`;
        frame.querySelector('source')!.sizes = sizes;
        frame.querySelector('img')!.sizes = sizes;
      };
      const showPhoto = async (index: number) => {
        const project = activeProject;
        const photo = project?.photos[index];
        if (!photo) return;
        activeIndex = index;
        const current = ++request;
        const nextBuffer = (buffer + 1) % frames.length;
        const frame = frames[nextBuffer]!;
        const source = frame.querySelector('source')!;
        const image = frame.querySelector('img')!;
        const webp = photo.variants.filter(
          (variant) => variant.format === 'webp',
        );
        const jpeg = photo.variants.filter(
          (variant) => variant.format === 'jpeg',
        );
        // Fit the viewer to the photograph, rather than boxing portraits into a landscape frame.
        dialog.style.setProperty(
          '--photo-ratio',
          String(photo.width / photo.height),
        );
        const srcset = (variants: PhotoVariant[]) =>
          variants
            .map((variant) => `${variant.src} ${variant.width}w`)
            .join(', ');
        stage.setAttribute('aria-busy', 'true');
        status.textContent = 'Loading photo';
        frame.dataset.photo = photo.id;
        image.width = photo.width;
        image.height = photo.height;
        image.alt = photo.alt;
        setSizes(frame, photo);
        source.srcset = srcset(webp);
        image.srcset = srcset(jpeg);
        image.src = jpeg.at(-1)!.src;
        try {
          await image.decode();
          if (current !== request || controller.signal.aborted) return;
          frames.forEach((item, itemIndex) => {
            item.classList.toggle('is-active', itemIndex === nextBuffer);
            item.setAttribute('aria-hidden', String(itemIndex !== nextBuffer));
          });
          buffer = nextBuffer;
          caption.textContent = photo.alt;
          position.textContent = `${index + 1} / ${project!.photos.length}`;
          thumbnails
            .querySelectorAll<HTMLButtonElement>('button')
            .forEach((button, buttonIndex) => {
              button.setAttribute(
                'aria-pressed',
                String(buttonIndex === index),
              );
            });
          status.textContent = `Photo ${index + 1} of ${project!.photos.length}`;
        } catch {
          if (current === request)
            status.textContent =
              'This photo could not be loaded. Please try another photo.';
        } finally {
          if (current === request) stage.setAttribute('aria-busy', 'false');
        }
      };
      const movePhoto = (direction: number) => {
        if (!activeProject || activeProject.photos.length < 2) return;
        void showPhoto(
          (activeIndex + direction + activeProject.photos.length) %
            activeProject.photos.length,
        );
      };
      const links = gallery.querySelectorAll<HTMLAnchorElement>(
        '[data-project-image]',
      );
      links.forEach((link) => {
        link.addEventListener(
          'click',
          (event) => {
            if (
              event.ctrlKey ||
              event.metaKey ||
              event.shiftKey ||
              event.altKey ||
              event.button !== 0
            )
              return;
            const project = projects.find(
              (project) => project.id === link.dataset.project,
            );
            if (!project?.photos.length) return;
            event.preventDefault();
            opener = link;
            activeProject = project;
            dialog.querySelector('[data-project-title]')!.textContent =
              project.title;
            dialog.querySelector('[data-project-description]')!.textContent =
              project.description;
            caption.textContent = '';
            position.textContent = `1 / ${project.photos.length}`;
            controls.forEach((button) => {
              button.disabled = project.photos.length < 2;
            });
            frames.forEach((frame) => {
              frame.classList.remove('is-active');
              frame.setAttribute('aria-hidden', 'true');
            });
            thumbnails.replaceChildren(
              ...project.photos.map((photo, index) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.dataset.photoIndex = String(index);
                button.dataset.photoId = photo.id;
                button.setAttribute(
                  'aria-label',
                  `View photo ${index + 1}: ${photo.alt}`,
                );
                button.setAttribute('aria-pressed', String(index === 0));
                const thumbnail = document.createElement('img');
                thumbnail.src = photo.variants.find(
                  (variant) => variant.format === 'webp',
                )!.src;
                thumbnail.alt = '';
                thumbnail.width = 80;
                thumbnail.height = 60;
                thumbnail.loading = 'lazy';
                button.append(thumbnail);
                return button;
              }),
            );
            thumbnails.hidden = project.photos.length < 2;
            dialog.showModal();
            void showPhoto(0);
          },
          options,
        );
      });
      thumbnails.addEventListener(
        'click',
        (event) => {
          const target =
            event.target instanceof Element
              ? event.target.closest<HTMLButtonElement>('[data-photo-index]')
              : null;
          if (target) void showPhoto(Number(target.dataset.photoIndex));
        },
        options,
      );
      dialog
        .querySelector('.lightbox-close')!
        .addEventListener('click', () => dialog.close(), options);
      dialog
        .querySelector('[data-previous-photo]')!
        .addEventListener('click', () => movePhoto(-1), options);
      dialog
        .querySelector('[data-next-photo]')!
        .addEventListener('click', () => movePhoto(1), options);
      dialog.addEventListener(
        'keydown',
        (event) => {
          if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
            return;
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            movePhoto(event.key === 'ArrowRight' ? 1 : -1);
          }
        },
        options,
      );
      dialog.addEventListener(
        'click',
        (event) => {
          if (event.target !== dialog) return;
          const rect = dialog.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            dialog.close();
        },
        options,
      );
      dialog.addEventListener(
        'close',
        () => {
          // A queued close event can arrive after a different project reopens the dialog.
          if (dialog.open) return;
          request++;
          activeProject = undefined;
          stage.setAttribute('aria-busy', 'false');
          opener?.focus({ preventScroll: true });
        },
        options,
      );
      window.addEventListener(
        'resize',
        () => {
          if (!dialog.open || !activeProject) return;
          frames.forEach((frame) => {
            const photo = activeProject!.photos.find(
              (photo) => photo.id === frame.dataset.photo,
            );
            if (photo) setSizes(frame, photo);
          });
        },
        options,
      );
      const filters = gallery.querySelector<HTMLElement>('.gallery-filters');
      if (filters) filters.hidden = false;
      gallery
        .querySelectorAll<HTMLButtonElement>('[data-filter]')
        .forEach((button) => {
          button.addEventListener(
            'click',
            () => {
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
              const summary = gallery.querySelector('.gallery-status');
              if (summary) summary.textContent = `${count} projects`;
              document.dispatchEvent(new Event('gallery:filter'));
            },
            options,
          );
        });
      gallery.dataset.ready = 'true';
      cleanups.push(() => {
        request++;
        controller.abort();
        if (dialog.open) dialog.close();
        delete gallery.dataset.ready;
      });
    });
}

document.addEventListener('astro:before-swap', () => {
  cleanups.splice(0).forEach((cleanup) => cleanup());
});
