"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { HandModel } from "@/components/HandModel";
import Lights from "@/components/Light";
import { useSearchParams } from "next/navigation";
import ModalGuide from "@/components/ModalMainGuide";
import { io } from "socket.io-client";
import Loading from "@/components/Loading";

export default function Home() {
  const [animation, setAnimation] = useState("Stop Animation");
  const [movement, setMovement] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const video = [
    { name: "Fist", src: "./stimulus/OpenFist.mp4" },
    { name: "Index", src: "./stimulus/Index.mp4" },
    { name: "Thumb", src: "./stimulus/Thumb.mp4" },
  ];

  const handleVideoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentVideoIndex(Number(e.target.value));
    setAnimation(video[Number(e.target.value)].name);
  };

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Loading />
        </div>
      }
    >
      <div className="bg-gray-100" style={{ height: "100vh" }}>
        <Canvas camera={{ position: [0, 0, 15] }}>
          <HandModel
            scale={2.5}
            position={[0, -6, 1.8]}
            animationName={animation}
          />
          <Lights />
          <spotLight
            position={[5, 5, 5]}
            angle={0.3}
            intensity={1}
            penumbra={0.5}
            castShadow
          />
          <Environment preset="sunset" />
        </Canvas>

        <div className="absolute bottom-5 left-0 right-0 flex justify-center mb-4">
          <p className="px-6 py-2 text-black rounded-lg text-lg">
            Gerakan:{" "}
            <strong>{animation !== "Stop Animation" ? animation : ""}</strong>
          </p>
        </div>

        <div className="absolute top-5 left-5 flex flex-col items-start mb-4">
          <div className="flex flex-row items-start gap-4">
            <button
              className="
              bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2
              transition duration-300 ease-in-out
            "
              onClick={() => {
                setShowVideo(!showVideo);
              }}
            >
              Show stimulus
            </button>
            {showVideo && (
              <select
                className="mb-2 p-2 rounded border border-gray-300 focus:outline-none"
                onChange={handleVideoChange}
                value={currentVideoIndex}
              >
                {video.map((v, index) => (
                  <option key={index} value={index}>
                    {v.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {showVideo && (
            <video
              ref={videoRef}
              src={video[currentVideoIndex].src}
              className="
                  w-full max-w-xs rounded-lg
                  transition-opacity duration-500 transform
                  opacity-100 translate-y-0
                "
              loop
              autoPlay
              muted
            />
          )}
        </div>
      </div>
    </Suspense>
  );
}
