"use client";

import ModalCalibrationResult from "@/components/ModalCalibrationResult";
import axios from "axios";
import { time } from "console";
import { useEffect, useState, Suspense } from "react"; // Import Suspense
import { io, Socket } from "socket.io-client";
export default function Home() {
  const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL; // Ensure this is correct
  const [data, setData] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Initialize the socket connection here
    const newSocket = io(SOCKET_SERVER_URL);

    newSocket.on("connect", () => {
      console.log("Socket connected");
    });

    newSocket.on("calibration_success", () => {
      console.log("Calibration success");
    });

    newSocket.on("get_data", () => {
      console.log("Data received");
    });

    newSocket.on("preprocess_data", (message) => {
      console.log("Data preprocessed");
    });

    newSocket.on("model_saved", (message) => {
      console.log("Model saved");
    });

    newSocket.on("testing_progress", (message) => {
      console.log(message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [SOCKET_SERVER_URL]);

  const startTesting = () => {
    const socket = io(SOCKET_SERVER_URL);
    const message = {
      time: 60,
      nama: "Testing",
    };
    socket.emit("start_testing", message);
  };

  const stopTesting = () => {
    const socket = io(SOCKET_SERVER_URL);
    socket.emit("stop_testing");
  };

  const handleOpenResult = () => {
    setIsOpen(true);
  };

  const fetchResult = () => {
    axios
      .get(`${SOCKET_SERVER_URL}/api/user/get-model/Farhan`)
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div>
      {data && (
        <div>
          <h1>{data}</h1>
        </div>
      )}

      <button onClick={startTesting}>Start Testing</button>
      <button onClick={stopTesting}>Stop Testing</button>
      <button onClick={handleOpenResult}>Open Result</button>

      <button onClick={fetchResult}>Get Result</button>

      <ModalCalibrationResult
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        name="Naren"
        isLoading={false}
      />
    </div>
  );
}
