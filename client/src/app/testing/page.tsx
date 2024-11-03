"use client";

import { time } from "console";
import { useEffect, useState, Suspense } from "react"; // Import Suspense
import { io, Socket } from "socket.io-client";
export default function Home() {
  const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL; // Ensure this is correct
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Initialize the socket connection here
    const newSocket = io(SOCKET_SERVER_URL);

    newSocket.on("connect", () => {
      console.log("Socket connected");
    });

    newSocket.on("calibration_data", (message) => {
      console.log("Received calibration data:", message);
      setData(message);
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
      time: 5,
      nama: "Testing",
    };
    socket.emit("start_testing", message);
  };

  const stopTesting = () => {
    const socket = io(SOCKET_SERVER_URL);
    socket.emit("stop_testing");
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
    </div>
  );
}
