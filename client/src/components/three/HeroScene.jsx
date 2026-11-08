import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';

// Cubic-bezier(0.22, 1, 0.36, 1) easeOut approximation
function easeOutCubic(t) {
  const p = 1 - t;
  return 1 - p * p * p;
}

/**
 * Crowd backing one petition:
 * Instanced spheres representing verified voters + a floating petition paper sheet
 */
function CrowdScene() {
  const groupRef = useRef();
  const instancedMeshRef = useRef();
  const sheetRef = useRef();
  const flyingVoterRef = useRef();

  // Lowers instances from 300 to 140 if FPS drops below 45
  const [instanceCount, setInstanceCount] = useState(280);

  // Pulse animation state for the paper sheet
  const pulseRef = useRef(0);

  // Flight animation state for the flying voter sphere
  const flightState = useRef({
    active: false,
    timer: 0,
    duration: 1.2,
    startPos: new THREE.Vector3(2.5, 1.2, 0.8),
    currentPos: new THREE.Vector3()
  });

  // Generate voter ring positions and colors
  const { positions, colors } = useMemo(() => {
    const pos = [];
    const col = [];
    const colorGray = new THREE.Color('#9B9B9B');
    const colorWhite = new THREE.Color('#ffffff');

    for (let i = 0; i < 300; i++) {
      // Loose spherical / torus distribution around the center petition
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.75;
      const radius = 2.4 + Math.random() * 1.5;

      const x = radius * Math.cos(theta) * Math.cos(phi);
      const y = radius * Math.sin(phi) + (Math.random() - 0.5) * 0.5;
      const z = radius * Math.sin(theta) * Math.cos(phi);

      pos.push(new THREE.Vector3(x, y, z));

      // 80% #9B9B9B, 20% white
      col.push(Math.random() > 0.8 ? colorWhite : colorGray);
    }

    return { positions: pos, colors: col };
  }, []);

  // Initialize instanced matrices
  useEffect(() => {
    if (!instancedMeshRef.current) return;
    const mesh = instancedMeshRef.current;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < instanceCount; i++) {
      dummy.position.copy(positions[i]);
      dummy.scale.setScalar(0.7 + Math.random() * 0.5);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, colors[i]);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [positions, colors, instanceCount]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Damped Mouse Parallax
    if (groupRef.current) {
      const targetRotY = state.pointer.x * 0.28;
      const targetRotX = -state.pointer.y * 0.22;

      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetRotY,
        4.0,
        delta
      );
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        targetRotX,
        4.0,
        delta
      );
    }

    // 2. Slow subtle rotation of the instanced crowd
    if (instancedMeshRef.current) {
      instancedMeshRef.current.rotation.y = time * 0.04;
    }

    // 3. Every 4 seconds, launch 1 voter sphere into the center petition
    flightState.current.timer += delta;
    if (flightState.current.timer >= 4.0) {
      flightState.current.timer = 0;
      flightState.current.active = true;

      // Pick a random voter position from the perimeter
      const randomIdx = Math.floor(Math.random() * instanceCount);
      flightState.current.startPos.copy(positions[randomIdx]);
    }

    if (flightState.current.active && flyingVoterRef.current) {
      const t = Math.min(1.0, flightState.current.timer / flightState.current.duration);
      const easedT = easeOutCubic(t);

      // Lerp from start position to center sheet (0, 0, 0)
      flightState.current.currentPos.lerpVectors(
        flightState.current.startPos,
        new THREE.Vector3(0, 0, 0.1),
        easedT
      );
      flyingVoterRef.current.position.copy(flightState.current.currentPos);

      // Scale down slightly as it absorbs
      const scale = 1.0 - easedT * 0.5;
      flyingVoterRef.current.scale.setScalar(scale);

      // Upon impact at t=1, trigger paper scale pulse
      if (t >= 1.0) {
        flightState.current.active = false;
        pulseRef.current = 1.0; // Trigger pulse
      }
    } else if (flyingVoterRef.current) {
      // Hide offscreen when inactive
      flyingVoterRef.current.position.set(0, -999, 0);
    }

    // 4. Paper sheet scale pulse decay
    if (sheetRef.current) {
      pulseRef.current = THREE.MathUtils.damp(pulseRef.current, 0, 6.0, delta);
      const scaleFactor = 1.0 + pulseRef.current * 0.08;
      sheetRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
  });

  return (
    <>
      {/* Dynamic performance monitor */}
      <PerformanceMonitor
        onDecline={() => setInstanceCount(140)}
        onIncline={() => setInstanceCount(280)}
      />

      {/* Soft natural lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 5, 4]} intensity={0.7} />

      <group ref={groupRef}>
        {/* Center: The Floating Petition Paper Sheet */}
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <group ref={sheetRef}>
            {/* Paper backing */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.7, 2.3, 0.02]} />
              <meshStandardMaterial
                color="#ffffff"
                roughness={0.4}
                metalness={0.05}
              />
            </mesh>

            {/* Simulated text lines on the petition */}
            <mesh position={[0, 0.75, 0.012]}>
              <planeGeometry args={[1.2, 0.1]} />
              <meshBasicMaterial color="#2563eb" />
            </mesh>
            <mesh position={[-0.15, 0.45, 0.012]}>
              <planeGeometry args={[0.9, 0.04]} />
              <meshBasicMaterial color="#94a3b8" />
            </mesh>
            <mesh position={[-0.05, 0.28, 0.012]}>
              <planeGeometry args={[1.1, 0.04]} />
              <meshBasicMaterial color="#cbd5e1" />
            </mesh>
            <mesh position={[-0.1, 0.11, 0.012]}>
              <planeGeometry args={[1.0, 0.04]} />
              <meshBasicMaterial color="#cbd5e1" />
            </mesh>

            {/* Stamp seal indicator */}
            <mesh position={[0.45, -0.65, 0.012]}>
              <circleGeometry args={[0.22, 24]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
          </group>
        </Float>

        {/* Instanced Voter Spheres (1 draw call) */}
        <instancedMesh
          ref={instancedMeshRef}
          args={[null, null, 300]}
          count={instanceCount}
        >
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial roughness={0.35} metalness={0.1} />
        </instancedMesh>

        {/* Active Voter flying sphere during vote transition */}
        <mesh ref={flyingVoterRef}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#3b82f6" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </>
  );
}

export default function HeroScene() {
  return <CrowdScene />;
}

