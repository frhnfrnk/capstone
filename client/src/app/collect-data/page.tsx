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
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<string[]>([]);

  const video = "./calibration/aa.mp4";
  const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);

    socket.on("get_data", () => {
      console.log("Data received");
      setStatus(["Data sudah diterima", "Sedang menyimpan data..."]);
    });

    socket.on("collect_data_success", (message) => {
      console.log("Data saved");
      setStatus(["Data sudah disimpan", " "]);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    });

    socket.on("collcet_data_done", (message) => {
      console.log("Colelct data Done");
      setIsLoading(false);
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
        console.error("Error attempting to request fullscreen:", error);
      });
    }
    const socket = io(SOCKET_SERVER_URL);
    const message = {
      time: 210,
      nama: name,
    };
    socket.emit("start_collect_data", message);
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
        isSuccess={false}
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
          Mulai
        </button>

        {elapsedTime > 0 && (
          <p className="mt-4">Elapsed Time: {elapsedTime.toFixed(2)} seconds</p>
        )}
      </div>
    </>
  );
};

export default Calibration;
