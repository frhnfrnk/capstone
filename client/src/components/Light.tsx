import React from "react";

const Lights = () => {
  return (
    <>
      {/* Soft ambient light for general illumination */}
      <ambientLight intensity={0.3} color="#ffccaa" /> {/* Soft warm color */}
      {/* Main directional light to simulate sunlight with warm color */}
      <directionalLight
        castShadow
        position={[-10, 10, 10]} // Positioned to illuminate the model effectively
        intensity={1.2} // Slightly reduced intensity for softer lighting
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        color="#ffd8a8" // Warm light for a natural look
      />
      {/* Additional point light for subtle highlights */}
      <pointLight
        position={[2, 5, 5]} // Positioned slightly above and to the front
        intensity={0.5} // Lower intensity for softer highlight
        distance={15}
        decay={2}
        color="#ffaa88" // Warm tone for a natural effect
      />
      {/* Secondary directional light for soft fill */}
      <directionalLight
        position={[10, -10, -10]} // Positioned to create fill light effect
        intensity={0.3} // Lower intensity for subtle fill
        color="#ffddcc" // Slightly warm fill light
      />
    </>
  );
};

export default Lights;
