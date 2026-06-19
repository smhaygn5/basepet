"use client";

/**
 * Basit oda sahnesi — zemin + arka duvar (plan1.md §2.2).
 * Offline-güvenli: HDR Environment yerine düz materyaller + sahne ışığı kullanır.
 */
export function Room() {
  return (
    <group>
      {/* Zemin */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a2035" roughness={0.9} />
      </mesh>

      {/* Arka duvar */}
      <mesh position={[0, 4, -5]} receiveShadow>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#111827" roughness={1} />
      </mesh>
    </group>
  );
}
