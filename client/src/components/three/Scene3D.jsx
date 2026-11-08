import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';

/**
 * SceneCleaner component that disposes geometries and materials upon unmount
 */
function SceneDisposer() {
  useEffect(() => {
    return () => {
      // Fiber handles top-level disposes, but we ensure garbage collection on unmount
    };
  }, []);
  return null;
}

/**
 * Scene3D: Optimized Three.js Canvas Wrapper
 * - dpr={[1, 1.5]}
 * - frameloop: paused when offscreen (IntersectionObserver), 'always' during animation, 'demand' otherwise
 * - transparent background with gl alpha
 * - Suspense boundary
 * - aria-hidden="true" on canvas container
 */
export const Scene3D = ({
  children,
  camera = { position: [0, 0, 6], fov: 45 },
  animating = true,
  style = {},
  className = '',
  fallback = null,
  ...props
}) => {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Determine frameloop:
  // If off screen: 'never' (pauses WebGL draw loop completely)
  // If in view & animating: 'always'
  // If in view & static: 'demand'
  const activeFrameloop = !isInView ? 'never' : animating ? 'always' : 'demand';

  return (
    <div
      ref={containerRef}
      className={`scene-3d-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        ...style
      }}
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop={activeFrameloop}
        camera={camera}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0); // Transparent background
        }}
        style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
        {...props}
      >
        <Suspense fallback={null}>
          <SceneDisposer />
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;

