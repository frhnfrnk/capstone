import { trace } from "console";
import React, { useEffect, useState } from "react";

interface ModalGamesProps {
  nextTarget: string;
  prevScore: number;
  setIsOpen: (value: boolean) => void;
  isOpen: boolean;
  tryCount: number;
  start: () => void;
}

const ModalGames = ({
  nextTarget,
  prevScore,
  setIsOpen,
  isOpen,
  start,
  tryCount,
}: ModalGamesProps) => {
  const [countdown, setCountdown] = useState(5);
  const radius = 38; // Radius of the circle
  const strokeWidth = 5; // Width of the stroke
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * countdown) / 5;

  const listImage = [
    "./movement/fist.jpg",
    "./movement/hook.jpg",
    "./movement/open.jpg",
    "./movement/index.jpg",
    "./movement/thumb.jpg",
  ];

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
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
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md  p-6 transition-transform transform-gpu scale-100 hover:scale-105">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          {tryCount === 0 ? "Persiapan" : "Anda berhasil"}
        </h2>
        {tryCount !== 0 && (
          <>
            <p className="text-lg text-gray-600 mb-4">
              Jumlah Percobaan:{" "}
              <strong className="text-blue-500">{tryCount}</strong>
            </p>
            <p className="text-lg text-gray-600 mb-4">
              Skor: <strong className="text-blue-500">{prevScore}</strong>
            </p>
          </>
        )}
        <p className="text-lg text-gray-600 mb-4 text-center">
          {prevScore === 0 ? "Target: " : "Target selanjutnya"}
        </p>
        <h1 className="text-3xl font-bold text-center text-red-500 mb-4">
          {nextTarget}
        </h1>
        <img
          src={listImage.find((item) =>
            item.includes(nextTarget.toLowerCase())
          )}
          alt={nextTarget}
          className="w-full mx-auto mb-3"
        />
        {prevScore === 0 ? (
          <h3 className="text-lg text-gray-700 mb-2 text-center">
            Memulai dalam:
          </h3>
        ) : (
          <h3 className="text-lg text-gray-700 mb-2 text-center">
            Memulai target baru dalam:
          </h3>
        )}
        <div className="flex items-center justify-center">
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
          <div className="absolute text-3xl font-bold text-red-500">
            {countdown}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalGames;
