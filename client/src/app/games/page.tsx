"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { HandModel } from "@/components/HandModel";
import Lights from "@/components/Light";
import { useSearchParams } from "next/navigation";
import ModalGuide from "@/components/ModalMainGuide";
import { io } from "socket.io-client";

export default function Home() {
  const searchParams = useSearchParams();
  const [animation, setAnimation] = useState("Stop Animation"); // Set default animation
  const [params, setParams] = useState(searchParams.get("model"));
  const [isOpen, setIsOpen] = useState(false);
  const [start, setStart] = useState(false);

  const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);

    socket.on("classification_progress", (message) => {
      console.log(message);
      setAnimation(message);
    });

    socket.on("classification_stopped", () => {
      console.log("Classification stopped");
      setAnimation("Stop Animation");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const startClassify = () => {
    const socket = io(SOCKET_SERVER_URL);
    socket.emit("start_classification");

    setStart(true);
  };

  const stopClassify = () => {
    const socket = io(SOCKET_SERVER_URL);
    socket.emit("stop_classification");

    setStart(false);
  };

  return (
    <div className="bg-gray-100" style={{ height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 15] }}>
        <HandModel
          scale={2.5}
          position={[0, -2, 1.8]}
          animationName={animation}
        />
        <Lights />
        {/* <ambientLight intensity={0.6} color="white" />
        <directionalLight color="white" position={[0, 5, 10]} intensity={1.2} /> */}
        <spotLight
          position={[5, 5, 5]}
          angle={0.3}
          intensity={1}
          penumbra={0.5}
          castShadow
        />
        {/* <pointLight position={[-5, 5, 5]} intensity={0.7} /> */}
        {/* <meshStandardMaterial color="brown" roughness={0.7} metalness={0.1} /> */}
        <Environment preset="sunset" />
      </Canvas>

      <ModalGuide isOpen={isOpen} setIsOpen={setIsOpen} start={startClassify} />

      <button
        className="absolute bottom-0 right-0 m-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out"
        onClick={stopClassify}
      >
        {start ? "Stop Classification" : "Start Classification"}
      </button>
    </div>
  );
}
