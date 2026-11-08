import { useState, useEffect } from 'react';

/**
 * Validates whether the client device & browser can smoothly render 3D scenes.
 * Returns false if:
 * - WebGL context is unavailable
 * - User has prefers-reduced-motion set
 * - navigator.hardwareConcurrency < 4
 * - Screen viewport is narrower than 768px
 */
export function useCanHandle3D() {
  const [canHandle, setCanHandle] = useState(() => {
    if (typeof window === 'undefined') return false;

    // 1. Check screen width
    if (window.innerWidth < 768) return false;

    // 2. Check prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }

    // 3. Check hardware concurrency (CPU logical cores)
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      return false;
    }

    // 4. Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return false;
    } catch {
      return false;
    }

    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkCapabilities = () => {
      // 1. Screen width check (< 768px)
      if (window.innerWidth < 768) {
        setCanHandle(false);
        return;
      }

      // 2. Prefers reduced motion
      const reducedMotion =
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion) {
        setCanHandle(false);
        return;
      }

      // 3. Hardware concurrency (< 4 cores)
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        setCanHandle(false);
        return;
      }

      // 4. WebGL support
      try {
        const canvas = document.createElement('canvas');
        const gl =
          canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
          setCanHandle(false);
          return;
        }
      } catch {
        setCanHandle(false);
        return;
      }

      setCanHandle(true);
    };

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => checkCapabilities();

    window.addEventListener('resize', checkCapabilities);
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handleMotionChange);
    }

    return () => {
      window.removeEventListener('resize', checkCapabilities);
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', handleMotionChange);
      }
    };
  }, []);

  return canHandle;
}

export default useCanHandle3D;
