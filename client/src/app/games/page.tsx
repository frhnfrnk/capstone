"use client";

import { useEffect, useState, Suspense } from "react"; // Import Suspense
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { HandModel } from "@/components/HandModel";
import Lights from "@/components/Light";
import { useSearchParams } from "next/navigation";
import ModalGuide from "@/components/ModalMainGuide";
import { io, Socket } from "socket.io-client";
import Loading from "@/components/Loading";
import ModalGames from "@/components/ModalGames";

export default function Home() {
  // const searchParams = useSearchParams();
  const [animation, setAnimation] = useState("Stop Animation"); // Set default animation
  const [isOpenGuide, setIsOpenGuide] = useState(false);
  const [isOpenScore, setIsOpenScore] = useState(false);
  const [start, setStart] = useState(false);
  const [target, setTarget] = useState<string>("");
  const [indexTarget, setIndexTarget] = useState(0);
  const [newTarget, setNewTarget] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [tryCount, setTryCount] = useState(0);
  const [resultClassify, setResultClassify] = useState({
    result: "",
    score: 0,
  });

  const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL; // Ensure this is correct
  const listTarget = ["Fist", "Hook", "Open", "Index", "Thumb"];
  const [socket, setSocket] = useState<Socket | null>(null); // Create a state for the socket

  useEffect(() => {
    setIsOpenGuide(true);
  }, []);

  useEffect(() => {
    // Initialize the socket connection here
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket); // Save the socket instance

    newSocket.on("connect", () => {
      console.log("Socket connected");
    });

    newSocket.on("classification_progress", (message) => {
      setAnimation(message.data);
      console.log("Received classification:", message.data);
      setResultClassify({
        result: message.data,
        score: message.accuration,
      });
    });

    newSocket.on("classification_stopped", () => {
      console.log("Classification stopped");
      setAnimation("Stop Animation");
    });

    return () => {
      newSocket.disconnect(); // Clean up the socket connection on unmount
    };
  }, [SOCKET_SERVER_URL]); // Depend on the URL

  const startClassify = () => {
    if (socket) {
      // Check if socket is initialized
      socket.emit("start_classification");
      setStart(true);
      setTryCount(0);
    } else {
      console.error("Socket is not initialized");
    }
  };

  const openScore = () => {
    setTarget(newTarget[indexTarget]);
    setIsOpenScore(true);
  };

  const stopClassify = () => {
    const socket = io(SOCKET_SERVER_URL);
    socket.emit("stop_classification");

    setStart(false);
  };

  const shuffleArray = (array: string[]): string[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Random index
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  };

  const handleButton = () => {
    if (start) {
      stopClassify();
    } else {
      startClassify();
    }
  };

  useEffect(() => {
    setNewTarget(shuffleArray(listTarget));
  }, []);

  useEffect(() => {
    if (start) {
      if (resultClassify.result == target) {
        setIndexTarget(indexTarget + 1);
        setTimeout(() => {
          openScore();
          stopClassify();
        }, 3000);
      }
      setTryCount(tryCount + 1);
    }
  }, [resultClassify]);

  useEffect(() => {
    console.log("Index Target", indexTarget);
    if (indexTarget >= listTarget.length) {
      setDone(true);
    }
  }, [indexTarget]);

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
            position={[0, -2, 1.8]}
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

        <ModalGuide
          isOpen={isOpenGuide}
          setIsOpen={setIsOpenGuide}
          start={openScore}
        />

        <ModalGames
          nextTarget={target}
          prevScore={resultClassify.score}
          isOpen={isOpenScore}
          setIsOpen={setIsOpenScore}
          start={startClassify}
          tryCount={tryCount}
        />

        <button
          className="absolute bottom-0 right-0 m-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out"
          onClick={handleButton}
        >
          {start ? "Stop Classification" : "Start Classification"}
        </button>
      </div>
    </Suspense>
  );
}
