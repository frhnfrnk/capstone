import React, { useEffect, useState } from "react";

interface ModalGamesProps {
  nextTarget: string;
  prevScore: number;
  setIsOpen: (value: boolean) => void;
  isOpen: boolean;
  tryCount: number;
  start: () => void;
  done: boolean;
  totalTryCount: number;
  allScore: number[];
  reload: () => void;
}

const ModalGames = ({
  nextTarget,
  prevScore,
  setIsOpen,
  isOpen,
  start,
  tryCount,
  done,
  totalTryCount,
  allScore,
  reload,
}: ModalGamesProps) => {
  const [countdown, setCountdown] = useState(10);
  const radius = 38; // Radius of the circle
  const strokeWidth = 5; // Width of the stroke
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * countdown) / 10;

  const listImage = [
    "./movement/fist.jpg",
    "./movement/hook.jpg",
    "./movement/open.jpg",
    "./movement/index.jpg",
    "./movement/thumb.jpg",
  ];

  const onHome = () => {
    window.location.href = "/";
  };

  useEffect(() => {
    if (isOpen && !done) {
      setCountdown(10);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            setIsOpen(false);
            start();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, setIsOpen, done, start]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 transition-transform transform-gpu scale-100 hover:scale-105 relative">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          {done
            ? "Semua Target Selesai!"
            : tryCount === 0
            ? "Persiapan"
            : "Anda berhasil"}
        </h2>
        {!done && tryCount !== 0 && (
          <>
            <p className="text-lg text-gray-600 mb-2">
              Jumlah Percobaan:{" "}
              <strong className="text-blue-500">{tryCount}</strong>
            </p>
            <p className="text-lg text-gray-600 mb-4">
              Skor: <strong className="text-blue-500">{prevScore}</strong>
            </p>
          </>
        )}
        {!done && (
          <>
            <p className="text-lg text-gray-600 mb-4 text-center">
              {prevScore === 0 ? "Target: " : "Target selanjutnya"}
            </p>
            <h1 className="text-4xl font-bold text-center text-red-500 mb-4">
              {nextTarget}
            </h1>
          </>
        )}
        {!done && (
          <img
            src={listImage.find((item) =>
              item.includes(nextTarget.toLowerCase())
            )}
            alt={nextTarget}
            className="w-full h-40 object-cover rounded-lg shadow-md mb-3"
          />
        )}

        {done ? (
          // When done is true, show options to restart or go home
          <>
            <div className="text-lg text-gray-700 mb-2">
              Total Percobaan:{" "}
              <strong className="text-blue-500">{totalTryCount}</strong>
            </div>
            <div className="text-lg text-gray-700 mb-4">
              Rata-rata score:{" "}
              <strong className="text-blue-500">
                {allScore.length > 0
                  ? (
                      allScore.reduce((a, b) => a + b, 0) / allScore.length
                    ).toFixed(2)
                  : 0}
              </strong>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={reload} // Restart the game
                className="w-full mr-2 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200"
              >
                Mulai Ulang
              </button>
              <button
                onClick={onHome} // Navigate to home
                className="w-full ml-2 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Kembali ke Home
              </button>
            </div>
          </>
        ) : (
          // When not done, show countdown
          <>
            <h3 className="text-lg text-gray-700 mb-2 text-center">
              Memulai dalam:
            </h3>
            <div className="flex items-center justify-center mb-4 relative">
              <svg width="120" height="120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="#e0e0e0"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="red"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-red-500">
                {countdown}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModalGames;
