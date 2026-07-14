import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { staggerItems, EASES, DURATIONS } from '../utils/animations';

export function useAnimatedList(deps = []) {
  const containerRef = useRef(null);
  const itemsRef = useRef([]);

  const getItems = () => {
    if (containerRef.current) {
      return containerRef.current.querySelectorAll('[data-animate]');
    }
    return [];
  };

  useEffect(() => {
    const items = getItems();
    if (items.length > 0) {
      staggerItems(items, {
        stagger: 0.05,
        to: { delay: 0.05 }
      });
    }
  }, deps);

  const animateAdd = (el, onComplete) => {
    gsap.fromTo(el,
      { opacity: 0, scale: 0.9, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: DURATIONS.normal, ease: EASES.spring, force3D: true, onComplete }
    );
  };

  const animateRemove = (el, onComplete) => {
    gsap.to(el, {
      opacity: 0, scale: 0.9, y: -10, duration: DURATIONS.fast, ease: EASES.smoothIn, force3D: true,
      onComplete
    });
  };

  return { containerRef, itemsRef, animateAdd, animateRemove };
}
