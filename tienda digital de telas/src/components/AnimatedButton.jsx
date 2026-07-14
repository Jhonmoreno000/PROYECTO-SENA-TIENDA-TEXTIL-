import React, { useRef, useCallback } from 'react';
import { microPress, microRelease, microHoverEnter, microHoverLeave, createRipple } from '../utils/animations';

export default function AnimatedButton({
  children,
  onClick,
  className = '',
  ripple = true,
  scaleOnHover = true,
  disabled = false,
  type = 'button',
  ...props
}) {
  const btnRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    if (disabled || !btnRef.current) return;
    microPress(btnRef.current);
    if (ripple) createRipple(e, btnRef.current);
  }, [disabled, ripple]);

  const handleMouseUp = useCallback(() => {
    if (disabled || !btnRef.current) return;
    microRelease(btnRef.current);
  }, [disabled]);

  const handleMouseEnter = useCallback(() => {
    if (disabled || !btnRef.current || !scaleOnHover) return;
    microHoverEnter(btnRef.current);
  }, [disabled, scaleOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (disabled || !btnRef.current) return;
    microHoverLeave(btnRef.current);
  }, [disabled]);

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${className}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
}
