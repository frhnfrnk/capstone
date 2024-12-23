"use client";

import { useEffect, useState, Suspense, useRef } from "react"; // Import Suspense
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { HandModel } from "@/components/HandModel";
import Lights from "@/components/Light";
import { useSearchParams } from "next/navigation";
import ModalGuide from "@/components/ModalMainGuide";
import { io } from "socket.io-client";
import Loading from "@/components/Loading";

export default function Home() {
  // const searchParams = useSearchParams();
  const [animation, setAnimation] = useState("Stop Animation");
  const [trigger, setTrigger] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [start, setStart] = useState(false);

  const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const [accuracy, setAccuracy] = useState(0);

  const searchParams = useSearchParams();

  const [isAudioOn, setIsAudioOn] = useState(false);

  const video = [
    { name: "Fist", src: "./stimulus/OpenFist.mp4" },
    { name: "Index", src: "./stimulus/Index.mp4" },
    { name: "Thumb", src: "./stimulus/Thumb.mp4" },
  ];

  const handleVideoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentVideoIndex(Number(e.target.value));
  };

  useEffect(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);

    socket.on("starting_classification", () => {
      console.log("Received classification:");
    });

    socket.on("classification_stopped", () => {
      console.log("Classification stopped");
      setAnimation("Stop Animation");
    });

    socket.on("result_classification", (message) => {
      console.log("Result classification:", message);
      setAnimation(message.result);
      let temp = message.accuracy * 25;
      setAccuracy(temp);
      setTrigger(Date.now());
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const startClassify = () => {
    const socket = io(SOCKET_SERVER_URL);
    const nama = searchParams.get("user") || "Anonymous";
    const message = {
      nama: nama,
    };
    socket.emit("start_classification", message);
    setShowVideo(true);
    setStart(true);
  };

  const stopClassify = () => {
    const socket = io(SOCKET_SERVER_URL);
    socket.emit("stop_classification");

    setStart(false);
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Loading />
        </div>
      }
    >
      {" "}
      {/* Add Suspense here */}
      <div className="bg-gray-100" style={{ height: "100vh" }}>
        <Canvas camera={{ position: [0, 0, 15] }}>
          <HandModel
            scale={2.5}
            position={[0, -6, 1.8]}
            animationName={animation}
            trigger={trigger}
          />
          <Lights />
          <Environment files="/models/venice_sunset_1k.hdr" />
        </Canvas>
        <audio id="audio" ref={audioRef} src="/audio/audio.MP3" controls />

        <ModalGuide
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          start={startClassify}
          setIsAudioOn={setIsAudioOn}
          isAudioOn={isAudioOn}
        />

        <div className="absolute bottom-5 left-0 right-0 flex justify-center mb-4">
          <p className="px-6 py-2 text-black rounded-lg text-lg">
            Gerakan:{" "}
            <strong>{animation !== "Stop Animation" ? animation : ""}</strong>
          </p>
          <p className="px-6 py-2 text-black rounded-lg text-lg">
            Score: <strong>{accuracy !== 0 ? accuracy.toString() : ""}</strong>
          </p>
        </div>

        <button
          className="absolute bottom-0 right-0 m-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out"
          onClick={stopClassify}
        >
          {start ? "Stop Classification" : "Start Classification"}
        </button>

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
                  w-full max-w-lg rounded-lg
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
