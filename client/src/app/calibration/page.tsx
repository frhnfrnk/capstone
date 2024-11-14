"use client";

import ModalCalibrationGuide from "@/components/ModalCalibrationGuide";
import ModalCalibrationResult from "@/components/ModalCalibrationResult";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

const Calibration = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [resultOpen, setResultOpen] = useState(false);
  const [name, setName] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<string[]>([]);
  const [videoStarted, setVideoStarted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);
  const [result, setResult] = useState({});

  const video = "./calibration/aa.mp4";
  const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);

    socket.on("calibration_done", (message) => {
      setIsLoading(false);
      setIsSuccess(true);
      setResult(message);
    });

    socket.on("calibration_failed", (message) => {
      console.log("Calibration failed:", message);
      setIsLoading(false);
      setIsSuccess(false);
    });

    socket.on("check_success", (message) => {
      console.log("Check success", message);
    });

    socket.on("calibration_started", () => {
      setStatus(["Kalibrasi telah selesai", "Memuat data..."]);
    });

    socket.on("reference_loaded", () => {
      setStatus(["Data berhasil dimuat", "Memulai kalibrasi..."]);
    });

    socket.on("preprocess_data", () => {
      setStatus(["Data berhasil diproses", "Menyesuaikan model..."]);
    });

    return () => {
      socket.disconnect();
    };
  }, [SOCKET_SERVER_URL]);

  const handleStart = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Error attempting to play the video:", error);
      });
      videoRef.current.requestFullscreen().catch((error) => {
        console.error("Error attempting to enter fullscreen:", error);
      });
    }
    const socket = io(SOCKET_SERVER_URL);
    const message = {
      time: 210,
      nama: name,
    };
    socket.emit("start_calibration", message);
  };

  const handleVideoEnded = () => {
    document.exitFullscreen().catch((error) => {
      console.error("Error attempting to exit fullscreen:", error);
    });
    setIsLoading(true);
    setResultOpen(true);
  };

  return (
    <>
      <ModalCalibrationGuide
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setUsername={setName}
      />

      <ModalCalibrationResult
        isOpen={resultOpen}
        setIsOpen={setResultOpen}
        name={name}
        isLoading={isLoading}
        status={status}
        isSuccess={isSuccess}
        result={result}
      />

      <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
        <p className="text-3xl font-bold">Hello, {name}</p>

        <video
          ref={videoRef}
          src={video}
          className="w-full max-w-5xl mt-4 rounded-lg border-2 border-gray-300"
          onEnded={handleVideoEnded}
        />

        <button
          onClick={handleStart}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-4 mt-4"
        >
          {videoStarted ? "Restart" : "Start"}
        </button>

        {elapsedTime > 0 && (
          <p className="mt-4">Elapsed Time: {elapsedTime.toFixed(2)} seconds</p>
        )}
      </div>
    </>
  );
};

export default Calibration;
