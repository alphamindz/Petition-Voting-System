import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 3D Step 1: Extruded Shield Shape
 */
function ShieldObject({ progress }) {
  const meshRef = useRef();

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 1.1);
    s.quadraticCurveTo(0.8, 1.1, 0.85, 0.3);
    s.quadraticCurveTo(0.85, -0.5, 0, -1.2);
    s.quadraticCurveTo(-0.85, -0.5, -0.85, 0.3);
    s.quadraticCurveTo(-0.8, 1.1, 0, 1.1);
    return s;
  }, []);

  const extrudeSettings = useMemo(
    () => ({
      depth: 0.18,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05
    }),
    []
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    // Step 1 active when progress is in [0, 0.33]
    const p1 = Math.min(1, Math.max(0, progress / 0.33));
    // Rotates in from -PI to 0
    const targetRotY = (1 - p1) * Math.PI * 1.5;
    const targetScale = p1 > 0.95 ? Math.max(0, (1 - (progress - 0.31) / 0.06)) : Math.min(1, p1 * 1.4);

    meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, targetRotY, 8.0, delta);
    meshRef.current.scale.setScalar(targetScale);
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial
          color="#2563eb"
          roughness={0.25}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}

/**
 * 3D Step 2: Paper Sheet Folding in from flat to upright
 */
function PaperFoldObject({ progress }) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    // Step 2 active in [0.33, 0.66]
    const p2 = Math.min(1, Math.max(0, (progress - 0.33) / 0.33));

    // Folds up from -PI/2 (flat) to 0 (upright)
    const targetRotX = (1 - p2) * -Math.PI * 0.5;
    // Scale in and out
    const isVisible = progress >= 0.28 && progress <= 0.72;
    let targetScale = isVisible ? 1.0 : 0.0;
    if (progress < 0.35) targetScale = (progress - 0.28) / 0.07;
    if (progress > 0.65) targetScale = Math.max(0, (0.72 - progress) / 0.07);

    meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, targetRotX, 8.0, delta);
    meshRef.current.scale.setScalar(targetScale);
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.8, 2.4, 0.03]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.05} />
      </mesh>
      {/* Visual content line on paper */}
      <mesh position={[0, 0.6, 0.02]}>
        <planeGeometry args={[1.2, 0.12]} />
        <meshBasicMaterial color="#2563eb" />
      </mesh>
      <mesh position={[-0.1, 0.3, 0.02]}>
        <planeGeometry args={[1.0, 0.05]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[-0.15, 0.1, 0.02]}>
        <planeGeometry args={[0.9, 0.05]} />
        <meshBasicMaterial color="#cbd5e1" />
      </mesh>
    </group>
  );
}

/**
 * 3D Step 3: Growing Stack of Voter Spheres
 */
function SupportStackObject({ progress }) {
  const groupRef = useRef();

  // Pre-calculate tiered sphere coordinates in a clean pyramid stack
  const spherePositions = useMemo(() => {
    const list = [];
    const radius = 0.14;
    const spacing = radius * 2.2;

    // Layer 1: 3x3 base (9 spheres)
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        list.push([x * spacing, -0.6, z * spacing]);
      }
    }
    // Layer 2: 2x2 mid (4 spheres)
    for (let x = -0.5; x <= 0.5; x += 1) {
      for (let z = -0.5; z <= 0.5; z += 1) {
        list.push([x * spacing, -0.6 + spacing * 0.85, z * spacing]);
      }
    }
    // Layer 3: 1 top apex
    list.push([0, -0.6 + spacing * 1.7, 0]);

    return list;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Step 3 active in [0.66, 1.0]
    const p3 = Math.min(1, Math.max(0, (progress - 0.66) / 0.34));

    const isVisible = progress >= 0.62;
    const targetScale = isVisible ? Math.min(1, (progress - 0.62) / 0.08) : 0;
    groupRef.current.scale.setScalar(targetScale);

    // Subtle gentle rotation as stack accumulates
    groupRef.current.rotation.y = progress * Math.PI * 0.8;
  });

  // Calculate how many spheres should appear based on progress
  const p3 = Math.min(1, Math.max(0, (progress - 0.66) / 0.34));
  const visibleCount = Math.floor(p3 * (spherePositions.length + 1));

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {spherePositions.map((pos, idx) => {
        if (idx >= visibleCount) return null;
        return (
          <mesh key={idx} position={pos}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial
              color={idx % 3 === 0 ? '#ffffff' : '#3b82f6'}
              roughness={0.3}
              metalness={0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Main 3D Canvas Scene for How It Works
 */
export default function HowItWorksScene({ progress }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 3]} intensity={0.8} />

      <ShieldObject progress={progress} />
      <PaperFoldObject progress={progress} />
      <SupportStackObject progress={progress} />
    </>
  );
}

