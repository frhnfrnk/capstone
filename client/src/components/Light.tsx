import React from "react";

const Lights = () => {
  return (
    <>
      {/* Ambient light for general illumination */}
      <ambientLight intensity={0.6} />{" "}
      {/* Increased intensity for brighter ambient light */}
      {/* Directional light to simulate sunlight */}
      <directionalLight
        castShadow
        position={[-10, 10, 10]} // Positioned to illuminate the model effectively
        intensity={1.5} // Increased intensity
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      {/* Additional point light for more dynamic lighting */}
      <pointLight
        position={[0, 5, 5]} // Positioned above and slightly in front of the model
        intensity={0.8} // Increased intensity
        distance={10}
        decay={2}
        color={"#ffffff"} // White light
      />
      {/* A second directional light to simulate bounced light */}
      <directionalLight
        castShadow
        position={[10, -10, -10]} // Positioned to create fill light effect
        intensity={0.5} // Maintained lower intensity for subtle fill
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
    </>
  );
};

export default Lights;
