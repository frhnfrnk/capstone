import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Loading from "./Loading";

interface ModalCalibrationResultProps {
  setIsOpen: (value: boolean) => void;
  isOpen: boolean;
  name: string;
  isLoading: boolean;
  status: string[];
  isSuccess: boolean;
}

const ModalCalibrationResult = ({
  setIsOpen,
  isOpen,
  name,
  isLoading,
  status,
  isSuccess,
}: ModalCalibrationResultProps) => {
  if (!isOpen) return null;
  const [isModeOpen, setIsModeOpen] = useState(false);
  const router = useRouter();

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;
  const [mode, setMode] = useState<string>("");

  useEffect(() => {
    if (window.localStorage.getItem("mode")) {
      setMode(window.localStorage.getItem("mode") || "");
    }
  }, []);

  const handleStartClick = () => {
    if (mode) {
      if (mode === "Games") {
        router.push(`/games?user=${name}`);
      } else {
        router.push(`/free?user=${name}`);
      }
    } else {
      window.localStorage.setItem(
        "calibration",
        isSuccess ? "success" : "failed"
      );
      router.push(`/`);
    }
  };

  const handleCancelMode = () => {
    setIsModeOpen(false);
  };

  const handleOutsideClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (isModeOpen && target.classList.contains("modal-overlay")) {
      setIsModeOpen(false);
    }
  };

  const backToMenu = () => {
    window.localStorage.setItem(
      "calibration",
      isSuccess ? "success" : "failed"
    );
    router.push(`/`);
  };

  const restartCalibration = () => {
    window.location.reload();
  };

  return (
    <div>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 transform transition-transform ease-in-out duration-300 scale-100">
          {isLoading ? (
            <div>
              <Loading w="w-16" h="h-16" />
              <h2 className="font-mono text-sm font-bold text-center text-gray-500 mt-4">
                {status[0]}
              </h2>
              <h2 className="font-mono text-sm font-bold text-center text-gray-500 mt-4">
                {status[1]}
              </h2>
            </div>
          ) : (
            <>
              {!isSuccess ? (
                <>
                  <h2 className="font-mono text-2xl font-bold text-center text-green-600 mb-4">
                    Kalibrasi Gagal :(
                  </h2>
                  <p className="text-center text-gray-700 mb-6">
                    Kalibrasi ulang diperlukan untuk memperbaiki hasil kalibrasi
                    Silakan klik tombol
                    <strong> "Ulangi" </strong> untuk memulai.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={backToMenu}
                      className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition duration-300 ease-in-out"
                    >
                      Kembali ke menu
                    </button>
                    <button
                      onClick={restartCalibration}
                      className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-300 ease-in-out"
                    >
                      Ulangi
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <img
                    src="/illustration/success.jpg"
                    alt="Success"
                    className="w-32 h-32 mx-auto mb-6 rounded-full"
                  />

                  <h2 className="font-mono text-2xl font-bold text-center text-green-600 mb-4">
                    🎉 Kalibrasi Berhasil!
                  </h2>

                  <p className="text-center text-gray-700 mb-6">
                    Anda telah berhasil melakukan kalibrasi. Silakan klik tombol
                    <strong> "Mulai {mode}" </strong> untuk memulai.
                  </p>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={backToMenu}
                      className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition duration-300 ease-in-out"
                    >
                      Kembali ke menu
                    </button>
                    <button
                      onClick={handleStartClick}
                      className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out"
                    >
                      Mulai {mode}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalCalibrationResult;
