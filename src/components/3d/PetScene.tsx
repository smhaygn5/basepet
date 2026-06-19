"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { PetModel } from "./PetModel";
import { Room } from "./Room";
import { Effects } from "./Effects";
import type { PetAnimationState } from "@/types";

/**
 * 3D sahne — Canvas + kamera + ışık + oda + prosedürel kedi + parçacık efektleri.
 * Mobil optimizasyon (plan §3.4 / 4.3): dpr cap, performance min, mobilde antialias
 * kapalı, daha küçük gölge haritası. Environment yerine yerel ışık → offline-güvenli.
 */
export default function PetScene({
  animation = "idle",
  showRoom = false,
}: {
  animation?: PetAnimationState;
  showRoom?: boolean;
}) {
  const isMobile = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 768px)").matches,
    [],
  );

  return (
    <Canvas
      shadows={!isMobile}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 1.6, 4.2], fov: 45 }}
      performance={{ min: 0.5 }}
      gl={{ antialias: !isMobile, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.5} />
      <hemisphereLight args={["#8b5cf6", "#1a2035", 0.4]} />
      <directionalLight
        position={[3, 6, 3]}
        intensity={1.3}
        castShadow={!isMobile}
        shadow-mapSize={isMobile ? [512, 512] : [1024, 1024]}
      />

      {showRoom && <Room />}
      <PetModel animation={animation} />
      <Effects animation={animation} />

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.45}
        scale={10}
        blur={2.4}
        far={4}
      />

      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2}
        minDistance={2.5}
        maxDistance={7}
        target={[0, 0.8, 0]}
      />
    </Canvas>
  );
}
