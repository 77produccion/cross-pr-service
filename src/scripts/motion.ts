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
      {
        all: 'all',
        desktop: '(min-width: 851px) and (hover: hover)',
        serviceDesktop: '(min-width: 901px)',
      },
      (context) => {
        const removers: (() => void)[] = [];
        // The heading and LCP photo remain visible at all times.
        if (root.querySelector('.hero-a')) {
          gsap.from('.hero-a-lede, .hero-a-actions, .hero-a-facts', {
            y: 18,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.out',
            clearProps: 'transform',
          });
        }
        if (root.querySelector('.hero-b')) {
          gsap.from('.hero-b-lede, .hero-b-actions, .hero-b-strip', {
            y: 16,
            duration: 0.7,
            stagger: 0.07,
            ease: 'power3.out',
            clearProps: 'transform',
          });
        }
        if (root.querySelector('.hero-c')) {
          gsap.from('.hero-c-lede, .hero-c-actions, .hero-c-meta', {
            y: 14,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power3.out',
            clearProps: 'transform',
          });
          const slides = Array.from(
            root.querySelectorAll<HTMLElement>('[data-hero-slide]'),
          );
          if (slides.length > 1) {
            let active = true;
            const carousel = gsap.timeline({
              paused: true,
              delay: 3,
              repeat: -1,
              defaults: { duration: 0.8, ease: 'power1.inOut' },
            });
            slides.forEach((slide, index) => {
              const next = slides[(index + 1) % slides.length]!;
              carousel.to(slide, { opacity: 0 }, index * 3);
              carousel.to(next, { opacity: 1 }, index * 3);
            });
            // Keep the same three-second cadence across the loop boundary.
            carousel.to({}, { duration: 2.2 });
            const photos = slides.map((slide) => slide.querySelector('img')!);
            photos.forEach((photo) => {
              photo.loading = 'eager';
            });
            void Promise.allSettled(photos.map((photo) => photo.decode())).then(
              () => {
                if (active) carousel.play();
              },
            );
            const onVisibility = () => {
              if (document.hidden) carousel.pause();
              else carousel.resume();
            };
            document.addEventListener('visibilitychange', onVisibility);
            removers.push(() => {
              active = false;
              document.removeEventListener('visibilitychange', onVisibility);
            });
          }
        }
        const belowFold = Array.from(
          root.querySelectorAll<HTMLElement>('[data-reveal]'),
        ).filter(
          (element) =>
            element.getBoundingClientRect().top >= window.innerHeight,
        );
        for (const element of belowFold) {
          gsap.from(element, {
            y: 38,
            duration: 0.9,
            ease: 'power3.out',
            clearProps: 'transform',
            scrollTrigger: { trigger: element, start: 'top 94%', once: true },
          });
        }
        gsap.to('.scroll-progress', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        });
        const serviceStage = root.querySelector<HTMLElement>(
          '[data-service-stage]',
        );
        if (serviceStage && context.conditions?.serviceDesktop) {
          const items = Array.from(
            serviceStage.querySelectorAll<HTMLElement>('[data-service-item]'),
          );
          const images = Array.from(
            serviceStage.querySelectorAll<HTMLElement>('[data-service-image]'),
          );
          const caption = serviceStage.querySelector<HTMLElement>(
            '[data-service-caption]',
          );
          const setActive = (index: number) => {
            images.forEach((image, imageIndex) => {
              image.classList.toggle('is-active', imageIndex === index);
            });
            items.forEach((item, itemIndex) => {
              item.classList.toggle('is-active', itemIndex === index);
            });
            if (caption) {
              caption.textContent =
                items[index]?.querySelector('h3')?.textContent?.trim() ?? '';
            }
          };
          setActive(0);
          items.forEach((item, index) => {
            ScrollTrigger.create({
              trigger: item,
              start: 'top 60%',
              end: 'bottom 60%',
              onToggle: (self) => {
                if (self.isActive) setActive(index);
              },
            });
          });
        }
        const refresh = () => ScrollTrigger.refresh();
        document.addEventListener('gallery:filter', refresh);
        const projectStrip = root.querySelector<HTMLElement>(
          '[data-work-viewport]',
        );
        if (projectStrip) {
          // Prepare offscreen slides before the horizontal animation reveals them.
          ScrollTrigger.create({
            trigger: projectStrip,
            start: 'top bottom+=700',
            once: true,
            onEnter: () => {
              projectStrip.querySelectorAll('img').forEach((image) => {
                image.loading = 'eager';
              });
            },
          });
        }
        if (context.conditions?.desktop) {
          root
            .querySelectorAll<HTMLElement>('[data-parallax] img')
            .forEach((image) =>
              gsap.fromTo(
                image,
                { scale: 1.08, yPercent: -3 },
                {
                  yPercent: 3,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: image.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.7,
                  },
                },
              ),
            );
          const workViewport = root.querySelector<HTMLElement>(
            '[data-work-viewport]',
          );
          const workTrack =
            root.querySelector<HTMLElement>('[data-work-track]');
          if (workViewport && workTrack) {
            workViewport.classList.add('is-pinned');
            removers.push(() => workViewport.classList.remove('is-pinned'));
            const distance = () =>
              Math.max(0, workTrack.scrollWidth - workViewport.clientWidth);
            gsap.to(workTrack, {
              x: () => -distance(),
              ease: 'none',
              scrollTrigger: {
                trigger: workViewport,
                start: () =>
                  `top ${document.querySelector('.site-header')?.getBoundingClientRect().height ?? 86}px`,
                end: () => `+=${distance()}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
                anticipatePin: 1,
              },
            });
          }
          root
            .querySelectorAll<HTMLElement>(
              '.service-image, .project-card .image-frame',
            )
            .forEach((card) => {
              const image = card.querySelector('img');
              const hover = gsap.timeline({
                paused: true,
                defaults: { duration: 0.45, ease: 'power2.out' },
              });
              if (image) hover.to(image, { scale: 1.045 }, 0);
              const enter = () => hover.play();
              const leave = () => hover.reverse();
              card.addEventListener('pointerenter', enter);
              card.addEventListener('pointerleave', leave);
              removers.push(() => {
                card.removeEventListener('pointerenter', enter);
                card.removeEventListener('pointerleave', leave);
              });
            });
        }
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
document.addEventListener('astro:before-swap', () => {
  generation++;
  cleanup?.();
  cleanup = undefined;
});
window.addEventListener('pagehide', () => {
  generation++;
  cleanup?.();
  cleanup = undefined;
});
window.addEventListener('pageshow', (event) => {
  if (event.persisted) void initMotion();
});
