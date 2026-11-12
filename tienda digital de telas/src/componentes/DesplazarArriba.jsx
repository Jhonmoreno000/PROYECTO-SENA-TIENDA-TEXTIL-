import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function DesplazarArriba() {
  const { pathname, search } = useLocation();

  // 1. Deshabilitar la restauración automática del scroll nativo del navegador (estándar para SPAs)
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  const resetScroll = () => {
    // Limpia la memoria de posiciones de ScrollTrigger para evitar anclajes de la página previa
    try {
      if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.clearScrollMemory) {
        ScrollTrigger.clearScrollMemory();
      }
    } catch {
      // Ignorar si ScrollTrigger no está inicializado
    }

    // Reset inmediato e instantáneo a (0, 0)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    // Contenedores secundarios o scrollables internos
    const scrollables = document.querySelectorAll('main, [data-scrollable], .overflow-y-auto');
    scrollables.forEach((el) => {
      el.scrollTop = 0;
    });
  };

  // useLayoutEffect para aplicar antes del primer repintado visible de la ruta
  useLayoutEffect(() => {
    resetScroll();
  }, [pathname, search]);

  // useEffect con micro-timers y requestAnimationFrame para páginas con Lazy Loading / Suspense
  useEffect(() => {
    resetScroll();

    const rAF = requestAnimationFrame(() => {
      resetScroll();
      try {
        if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh) {
          ScrollTrigger.refresh();
        }
      } catch {
        // Ignorar
      }
    });

    const timer1 = setTimeout(() => {
      resetScroll();
    }, 50);

    const timer2 = setTimeout(() => {
      resetScroll();
      try {
        if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh) {
          ScrollTrigger.refresh();
        }
      } catch {
        // Ignorar
      }
    }, 150);

    return () => {
      cancelAnimationFrame(rAF);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname, search]);

  return null;
}

export default DesplazarArriba;
