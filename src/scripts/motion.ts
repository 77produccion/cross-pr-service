let cleanup: (() => void) | undefined;
let generation = 0;

async function initMotion() {
  const current = ++generation;
  cleanup?.();
  cleanup = undefined;
  const root = document.querySelector<HTMLElement>('main');
  if (!root) return;
  try {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
    if (current !== generation || !root.isConnected) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    cleanup = () => media.revert();
    media.add(
      'all',
      () => {
        const removers: (() => void)[] = [];
        // H1, LCP and all content stay visible, even if enhancement fails.
        const heroPicture = root.querySelector('.hero-slide.is-first picture');
        if (heroPicture) {
          gsap.to(heroPicture, {
            scale: 1.04,
            duration: 5.2,
            ease: 'power1.out',
          });
          gsap.from('.hero-text, .actions', {
            y: 18,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.out',
            clearProps: 'transform',
          });
        }
        const slides = Array.from(
          root.querySelectorAll<HTMLElement>('[data-hero-slide]'),
        );
        if (slides.length > 1) {
          let active = true;
          let ready = false;
          let awaitingPhoto = false;
          let currentSlide = 0;
          const duration = 1.2;
          const hold = 4;
          const carousel = gsap.timeline({
            paused: true,
            defaults: { duration, ease: 'power1.inOut' },
          });
          const loadPhoto = async (slide: HTMLElement) => {
            const image = slide.querySelector('img')!;
            slide
              .querySelectorAll<HTMLSourceElement>('source[data-srcset]')
              .forEach((source) => {
                source.srcset = source.dataset.srcset!;
              });
            if (image.dataset.srcset) image.srcset = image.dataset.srcset;
            if (image.dataset.src) image.src = image.dataset.src;
            image.loading = 'eager';
            await image.decode();
          };
          const advance = async () => {
            awaitingPhoto = true;
            let next = (currentSlide + 1) % slides.length;
            // Decode only the next frame; failed photos are skipped, not faded in.
            for (let attempt = 0; attempt < slides.length; attempt++) {
              try {
                await loadPhoto(slides[next]!);
                break;
              } catch {
                next = (next + 1) % slides.length;
              }
            }
            if (!active) return;
            const previous = slides[currentSlide]!;
            carousel.pause().clear();
            if (next !== currentSlide) {
              if (next === 0) {
                // The first finished photo remains opaque below every transition.
                carousel.to(previous, { opacity: 0 });
              } else {
                carousel.set(slides[next]!, { zIndex: 2, opacity: 0 });
                carousel.to(slides[next]!, { opacity: 1 }, 0);
                if (currentSlide !== 0)
                  carousel.set(previous, { opacity: 0, zIndex: 0 }, duration);
                carousel.set(slides[next]!, { zIndex: 1 }, duration);
              }
              carousel.fromTo(
                slides[next]!.querySelector('picture')!,
                { scale: 1 },
                {
                  scale: 1.04,
                  duration: duration + hold,
                  ease: 'power1.out',
                  immediateRender: false,
                },
                0,
              );
              currentSlide = next;
            }
            carousel.to({}, { duration: hold }, duration);
            awaitingPhoto = false;
            if (document.hidden) carousel.pause(0);
            else carousel.restart();
          };
          carousel.eventCallback('onComplete', () => void advance());
          const onVisibility = () => {
            if (document.hidden) carousel.pause();
            else if (ready && active && !awaitingPhoto) carousel.resume();
          };
          document.addEventListener('visibilitychange', onVisibility);
          void (async () => {
            try {
              await loadPhoto(slides[0]!);
              if (!active) return;
              ready = true;
              carousel.to({}, { duration: hold });
              if (!document.hidden) carousel.play();
            } catch {
              // A failed secondary image leaves the original hero visible.
            }
          })();
          removers.push(() => {
            active = false;
            document.removeEventListener('visibilitychange', onVisibility);
          });
        }
        root
          .querySelectorAll<HTMLElement>('[data-photo-motion]')
          .forEach((frame) => {
            const picture = frame.querySelector('picture');
            if (!picture) return;
            // Separate layers: GSAP zooms the picture; CSS handles image hover.
            // Comparison pairs and the uncropped lightbox never opt into this.
            gsap.to(picture, {
              scale: 1.035,
              duration: 1.6,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: frame,
                start: 'top 92%',
                once: true,
              },
            });
          });
        root
          .querySelectorAll<HTMLElement>('[data-reveal]')
          .forEach((element) => {
            if (element.getBoundingClientRect().top < window.innerHeight)
              return;
            gsap.from(element, {
              y: 26,
              duration: 0.8,
              ease: 'power3.out',
              clearProps: 'transform',
              scrollTrigger: { trigger: element, start: 'top 94%', once: true },
            });
          });
        gsap.to('.scroll-progress', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { start: 0, end: 'max', scrub: true },
        });
        const refresh = () => ScrollTrigger.refresh();
        document.addEventListener('gallery:filter', refresh);
        void document.fonts.ready.then(() => {
          if (current === generation) refresh();
        });
        return () => {
          removers.forEach((remove) => remove());
          document.removeEventListener('gallery:filter', refresh);
        };
      },
      document.body,
    );
  } catch (error) {
    cleanup?.();
    if (import.meta.env.DEV)
      console.warn('Motion enhancement unavailable.', error);
  }
}

void initMotion();
document.addEventListener('astro:page-load', () => void initMotion());
const dispose = () => {
  generation++;
  cleanup?.();
  cleanup = undefined;
};
document.addEventListener('astro:before-swap', dispose);
window.addEventListener('pagehide', dispose);
window.addEventListener('pageshow', (event) => {
  if (event.persisted) void initMotion();
});
