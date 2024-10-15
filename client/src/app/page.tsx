"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { HandModel } from "@/components/HandModel";
import Lights from "@/components/Light";

export default function Home() {
  const [animation, setAnimation] = useState("Thumb Flexion"); // Set default animation

  return (
    <div style={{ height: "100vh", backgroundColor: "#34495E" }}>
      <Canvas camera={{ position: [0, 2, 5] }}>
        <HandModel
          scale={1.3}
          position={[0, -1.5, 0]}
          animationName={animation}
        />
        <Lights />
        {/* <OrbitControls /> */}
        {/* <axesHelper args={[5]} /> */}
      </Canvas>

      <div className="absolute top-0 left-0 flex flex-col justify-center gap-4 p-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setAnimation("Genggam")}
        >
          Genggam
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setAnimation("Hook Fist")}
        >
          Hook Fist
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setAnimation("Index Flexion")}
        >
          Index Flexion
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setAnimation("Open")}
        >
          Open
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setAnimation("Thumb Flexion")}
        >
          Thumb Flexion
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setAnimation("Stop Animation")}
        >
          Stop Animation
        </button>
      </div>
    </div>
  );
}
