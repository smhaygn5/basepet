"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { MathUtils } from "three";
import type { PetAnimationState } from "@/types";

/**
 * Prosedürel low-poly kedi — R3F primitiflerinden inşa edilmiştir
 * (Faz1'deki dönen küpün yerini alır). Animasyonlar kod tabanlıdır
 * (useFrame), `animation` prop'una göre sürülür. Kafa, fare imlecini takip eder.
 *
 * Faz2 sonrası: Meshy.ai/Blender ile üretilmiş gerçek GLB ile değiştirilebilir.
 */
export function PetModel({
  animation = "idle",
}: {
  animation?: PetAnimationState;
}) {
  const root = useRef<Group>(null);
  const head = useRef<Group>(null);
  const tail = useRef<Mesh>(null);
  const body = useRef<Group>(null);

  // Renkler (orange tabby — koyu temada belirgin)
  const FUR = "#f59e0b";
  const FUR_DARK = "#b45309";
  const CREAM = "#fde68a";

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!root.current || !head.current || !tail.current || !body.current) return;

    // Varsayılan hedefler
    let bodyY = 0;
    let bodyScaleY = 1;
    let rootRotZ = 0;
    let headPitch = 0;
    let tailSpeed = 2;
    let tailAmp = 0.4;
    let hop = 0;

    switch (animation) {
      case "eat":
        headPitch = 0.5 + Math.sin(t * 8) * 0.15; // başını eğip yer
        break;
      case "play":
        hop = Math.abs(Math.sin(t * 6)) * 0.35; // zıplama
        tailSpeed = 6;
        tailAmp = 0.7;
        break;
      case "sleep":
        bodyY = -0.25;
        bodyScaleY = 0.7; // kıvrılma
        headPitch = 0.4;
        tailSpeed = 0.5;
        tailAmp = 0.1;
        break;
      case "bath":
        rootRotZ = Math.sin(t * 12) * 0.12; // silkinme
        break;
      case "toilet":
        bodyY = -0.18;
        bodyScaleY = 0.8;
        break;
      case "happy":
        hop = Math.abs(Math.sin(t * 10)) * 0.4;
        tailSpeed = 8;
        tailAmp = 0.8;
        break;
      case "sad":
        bodyY = -0.12;
        headPitch = 0.6;
        tailSpeed = 0;
        tailAmp = 0;
        break;
      case "idle":
      default: {
        bodyY = Math.sin(t * 1.5) * 0.03; // nefes
        // Idle varyasyonu: ~her 9 sn'de bir kısa gerinme (esneme)
        const cycle = t % 9;
        if (cycle < 1.2) {
          const s = Math.sin((cycle / 1.2) * Math.PI);
          bodyScaleY = 1 + s * 0.12;
          headPitch = -s * 0.25; // başını yukarı kaldır
          tailAmp = 0.4 + s * 0.3;
        }
        break;
      }
    }

    // Yumuşak geçişler
    root.current.position.y = MathUtils.lerp(root.current.position.y, hop, 0.2);
    root.current.rotation.z = MathUtils.lerp(root.current.rotation.z, rootRotZ, 0.2);
    body.current.position.y = MathUtils.lerp(body.current.position.y, bodyY, 0.1);
    body.current.scale.y = MathUtils.lerp(body.current.scale.y, bodyScaleY, 0.1);

    // Kuyruk sallama
    tail.current.rotation.z = Math.sin(t * tailSpeed) * tailAmp;

    // Bakış takibi: kafa fare imlecini izler (+ animasyon pitch'i)
    const px = state.pointer.x;
    const py = state.pointer.y;
    head.current.rotation.y = MathUtils.lerp(head.current.rotation.y, px * 0.5, 0.1);
    head.current.rotation.x = MathUtils.lerp(
      head.current.rotation.x,
      headPitch - py * 0.3,
      0.1,
    );
  });

  return (
    <group ref={root} position={[0, 0, 0]} scale={1.1}>
      <group ref={body}>
        {/* Gövde */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <capsuleGeometry args={[0.42, 0.5, 8, 16]} />
          <meshStandardMaterial color={FUR} roughness={0.7} />
        </mesh>
        {/* Karın (cream) */}
        <mesh position={[0, 0.32, 0.18]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color={CREAM} roughness={0.8} />
        </mesh>

        {/* Bacaklar */}
        {[
          [-0.22, 0, 0.2],
          [0.22, 0, 0.2],
          [-0.22, 0, -0.2],
          [0.22, 0, -0.2],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 0.3, 10]} />
            <meshStandardMaterial color={FUR_DARK} roughness={0.7} />
          </mesh>
        ))}

        {/* Kuyruk */}
        <mesh ref={tail} position={[0, 0.5, -0.45]} rotation={[0.6, 0, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.6, 6, 10]} />
          <meshStandardMaterial color={FUR_DARK} roughness={0.7} />
        </mesh>
      </group>

      {/* Kafa grubu */}
      <group ref={head} position={[0, 1.0, 0.18]}>
        <mesh castShadow>
          <sphereGeometry args={[0.34, 24, 24]} />
          <meshStandardMaterial color={FUR} roughness={0.7} />
        </mesh>

        {/* Kulaklar */}
        {[-0.2, 0.2].map((x) => (
          <mesh key={x} position={[x, 0.3, 0]} rotation={[0, 0, x > 0 ? -0.3 : 0.3]} castShadow>
            <coneGeometry args={[0.13, 0.25, 4]} />
            <meshStandardMaterial color={FUR_DARK} roughness={0.7} />
          </mesh>
        ))}

        {/* Gözler */}
        {[-0.13, 0.13].map((x) => (
          <mesh key={x} position={[x, 0.04, 0.3]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.4} />
          </mesh>
        ))}

        {/* Burun */}
        <mesh position={[0, -0.06, 0.34]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ef4444" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
