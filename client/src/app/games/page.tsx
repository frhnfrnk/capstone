"use client";

import { useEffect, useState, Suspense } from "react"; // Import Suspense
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { HandModel } from "@/components/HandModel";
import Lights from "@/components/Light";
import { useSearchParams } from "next/navigation";
import ModalGuide from "@/components/ModalMainGuide";
import { io } from "socket.io-client";
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
  const [newTarget, setNewTarget] = useState([]);
  const [done, setDone] = useState(false);
  const [stop, setStop] = useState(true);
  const [tryCount, setTryCount] = useState(0);
  const [resultClassify, setResultClassify] = useState({
    result: "",
    score: 0,
  });

  const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;
  const listTarget = ["Fist", "Hook", "Open", "Index", "Thumb"];

  useEffect(() => {
    setIsOpenGuide(true);
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
    setTryCount(0);
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

  const shuffleArray = (array: any) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Random index
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  };

  useEffect(() => {
    setNewTarget(shuffleArray(listTarget));
  }, []);

  useEffect(() => {
    if (!stop) {
      if (resultClassify.result == target) {
        setIndexTarget(indexTarget + 1);
        openScore();
        stopClassify();
      }
      setTryCount(tryCount + 1);
    }
  }, [resultClassify]);

  useEffect(() => {
    if (indexTarget > listTarget.length) {
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
      </div>
    </Suspense>
  );
}
