"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { InstancedMesh } from "three";
import { Object3D } from "three";
import type { PetAnimationState } from "@/types";

const COUNT = 14;

/**
 * Aksiyona bağlı parçacık efektleri (plan1.md §3.1):
 * - eat  → düşen mama taneleri (amber)
 * - bath → su damlaları (cyan)
 * Diğer durumlarda görünmez. Hafif: tek instancedMesh + useFrame.
 */
export function Effects({ animation }: { animation: PetAnimationState }) {
  const ref = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  // Deterministik pseudo-random faz/offset (render'da saf — Math.random YOK)
  const seeds = useMemo(() => {
    const rand = (i: number, n: number) => {
      const x = Math.sin((i + 1) * n) * 43758.5453;
      return x - Math.floor(x); // 0..1
    };
    return Array.from({ length: COUNT }, (_, i) => ({
      x: (rand(i, 12.9898) - 0.5) * 1.2,
      z: (rand(i, 78.233) - 0.5) * 1.2,
      speed: 0.6 + rand(i, 37.719) * 0.8,
      phase: rand(i, 4.1414),
    }));
  }, []);

  const active = animation === "eat" || animation === "bath";
  const color = animation === "bath" ? "#22d3ee" : "#f59e0b";

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.visible = active;
    if (!active) return;

    const t = state.clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      const s = seeds[i];
      // 0..1 düşüş ilerlemesi (döngüsel)
      const p = (t * s.speed + s.phase) % 1;
      const y = 1.6 - p * 1.6; // tepeden zemine düş
      dummy.position.set(s.x, y, s.z + 0.1);
      const scale = 0.05 * (1 - p * 0.5);
      dummy.scale.setScalar(Math.max(0.01, scale));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} visible={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </instancedMesh>
  );
}
