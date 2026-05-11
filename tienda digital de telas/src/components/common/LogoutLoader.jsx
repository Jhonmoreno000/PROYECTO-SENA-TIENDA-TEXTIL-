import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

function CubeSpinner() {
  const clr = 'rgb(247, 197, 159)';
  const clrAlpha = 'rgba(247, 197, 159, 0.1)';
  const size = 70.4;
  const half = size / 2;
  const keyframes = `@keyframes spinner-cube{0%{transform:rotate(45deg) rotateX(-25deg) rotateY(25deg)}50%{transform:rotate(45deg) rotateX(-385deg) rotateY(25deg)}100%{transform:rotate(45deg) rotateX(-385deg) rotateY(385deg)}}`;
  const faceBase = { backgroundColor: clrAlpha, height: '100%', position: 'absolute', width: '100%', border: `3.5px solid ${clr}`, boxSizing: 'border-box' };
  const faces = [
    { transform: `translateZ(-${half}px) rotateY(180deg)` },
    { transform: `rotateY(-270deg) translateX(50%)`, transformOrigin: 'top right' },
    { transform: `rotateY(270deg) translateX(-50%)`, transformOrigin: 'center left' },
    { transform: `rotateX(90deg) translateY(-50%)`, transformOrigin: 'top center' },
    { transform: `rotateX(-90deg) translateY(50%)`, transformOrigin: 'bottom center' },
    { transform: `translateZ(${half}px)` },
  ];
  return (
    <>
      <style>{keyframes}</style>
      <div style={{ width: `${size}px`, height: `${size}px`, animation: 'spinner-cube 1.6s infinite ease', transformStyle: 'preserve-3d', position: 'relative' }}>
        {faces.map((face, i) => (<div key={i} style={{ ...faceBase, ...face }} />))}
      </div>
    </>
  );
}

export default function LogoutLoader({ children, isLoggingOut }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isLoggingOut) {
      if (overlayRef.current) gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35 });
      if (contentRef.current) gsap.fromTo(contentRef.current, { scale: 0.85, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.3, delay: 0.1, ease: "power2.out" });
    }
  }, [isLoggingOut]);

  return (
    <>
      {children}
      {isLoggingOut && (
        <div ref={overlayRef} style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }} className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/50">
          <div ref={contentRef} className="flex flex-col items-center gap-8 bg-white/10 dark:bg-slate-900/40 p-12 min-w-[300px] rounded-3xl backdrop-blur-2xl border border-white/20 dark:border-slate-700/40 shadow-[0_8px_40px_0_rgba(0,0,0,0.4)]">
            <CubeSpinner />
            <div className="flex flex-col items-center text-center gap-1.5">
              <p className="text-lg font-semibold text-white tracking-wide">Cerrando sesión</p>
              <p className="text-sm text-slate-300 font-light">Guardando y sincronizando tus datos...</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
