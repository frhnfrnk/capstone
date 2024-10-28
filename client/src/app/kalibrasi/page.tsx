"use client";

import ModalCalibrationGuide from "@/components/ModalCalibrationGuide";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const Calibration = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const videos = ["/calibration/thumb.mp4", "/calibration/thumb.mp4"];
  const SOCKET_SERVER_URL = "http://localhost:5000";

  useEffect(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);

    socket.on("calibration_started", () => {
      console.log("Calibration has started");
    });

    socket.on("calibration_ended", (time) => {
      console.log("Calibration ended. Time taken:", time);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleStart = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Error attempting to play the video:", error);
      });

      const socket = io(SOCKET_SERVER_URL);
      socket.emit("start_calibration");
    }
  };

  const handleVideoEnded = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }

    const socket = io(SOCKET_SERVER_URL);
    socket.emit("end_calibration");
  };

  return (
    <>
      <ModalCalibrationGuide
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setUsername={setName}
      />

      <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
        <p className="text-3xl font-bold">Hello, {name}</p>

        <video
          ref={videoRef}
          src={videos[currentVideoIndex]}
          className="w-full max-w-2xl mt-4 rounded-lg"
          controls
          onEnded={handleVideoEnded}
        />

        <button
          onClick={handleStart}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-4 mt-4"
        >
          {currentVideoIndex === 0 ? "Mulai" : "Lanjut ke gerakan selanjutnya"}
        </button>

        {elapsedTime > 0 && (
          <p className="mt-4">Elapsed Time: {elapsedTime.toFixed(2)} seconds</p>
        )}
      </div>
    </>
  );
};

export default Calibration;
