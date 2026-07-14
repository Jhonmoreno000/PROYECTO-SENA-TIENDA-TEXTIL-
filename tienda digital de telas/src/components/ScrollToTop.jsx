import { useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { LenisContext } from './SmoothScrollProvider';

function ScrollToTop() {
  const { pathname } = useLocation();
  const lenisRef = useContext(LenisContext);

  useEffect(() => {
    if (lenisRef?.current) {
      lenisRef.current.scrollTo(0, { duration: 0, immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenisRef]);

  return null;
}
export default ScrollToTop;
