"use client";

import { useEffect, useState, Suspense, useRef } from "react"; // Import Suspense
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
  const [animation, setAnimation] = useState("Stop Animation");
  const [animationTrigger, setAnimationTrigger] = useState(0);
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

  const [totalTryCount, setTotalTryCount] = useState(0);
  const [allScore, setAllScore] = useState<number[]>([]);

  const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;
  const listTarget = ["Fist", "Index", "Thumb"];
  const [socket, setSocket] = useState<Socket | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(true);

  const video = [
    { name: "Fist", src: "./stimulus/OpenFist.mp4" },
    { name: "Index", src: "./stimulus/Index.mp4" },
    { name: "Thumb", src: "./stimulus/Thumb.mp4" },
  ];

  const handleVideoChange = (index: any) => {
    const findVideo = video.find((item) => item.name === newTarget[index]);
    if (findVideo) {
      setCurrentVideoIndex(video.indexOf(findVideo));
    }
  };

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
      console.log("Received classification:", message.data);
      setAnimation(message.data);
      setResultClassify({
        result: message.data,
        score: message.accuration,
      });
      setAnimationTrigger(Date.now());
    });

    newSocket.on("classification_stopped", () => {
      console.log("Classification stopped");
      setAnimation("Stop Animation");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [SOCKET_SERVER_URL]);

  const startClassify = () => {
    if (socket) {
      socket.emit("start_classification");
      setDone(false);
      setStart(true);
      setTryCount(0);
      handleVideoChange(indexTarget);
    } else {
      console.error("Socket is not initialized");
    }
  };

  const openScore = (index?: any) => {
    if (index >= listTarget.length) {
      setTarget("");
      setIsOpenScore(true);
      return;
    }
    setTarget(newTarget[index]);
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

  const reload = () => {
    setNewTarget(shuffleArray(listTarget));
    setAllScore([]);
    setTotalTryCount(0);
    setIndexTarget(0);
    setDone(false);
    setTarget("");
    setTryCount(0);
    setStart(false);

    setTimeout(() => {
      openScore(0);
    }, 2000);
  };

  useEffect(() => {
    setNewTarget(shuffleArray(listTarget));
  }, []);

  useEffect(() => {
    if (start) {
      if (resultClassify.result == target) {
        setIndexTarget(indexTarget + 1);
        setAllScore([...allScore, resultClassify.score]);
        setTimeout(() => {
          openScore(indexTarget + 1);
          stopClassify();
        }, 3000);
      }
      setTotalTryCount(totalTryCount + 1);
      setTryCount(tryCount + 1);
    }
  }, [resultClassify]);

  useEffect(() => {
    if (indexTarget >= listTarget.length) {
      setIndexTarget(0);
      setDone(true);
      setTarget("");
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
            position={[0, -6, 1.8]}
            animationName={animation}
            trigger={animationTrigger}
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
          start={() => {
            openScore(0);
          }}
        />

        <ModalGames
          nextTarget={target}
          prevScore={resultClassify.score}
          isOpen={isOpenScore}
          setIsOpen={setIsOpenScore}
          start={startClassify}
          tryCount={tryCount}
          done={done}
          totalTryCount={totalTryCount}
          allScore={allScore}
          reload={reload}
        />

        <button
          className="absolute bottom-0 right-0 m-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out"
          onClick={handleButton}
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
