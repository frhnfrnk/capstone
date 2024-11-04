import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface ModalCalibrationResultProps {
  setIsOpen: (value: boolean) => void;
  isOpen: boolean;
  name: string;
}

const ModalCalibrationResult = ({
  setIsOpen,
  isOpen,
  name,
}: ModalCalibrationResultProps) => {
  if (!isOpen) return null;
  const [isModeOpen, setIsModeOpen] = useState(false);
  const router = useRouter();
  const [result, setResult] = useState<any>({
    accuracy: 0,
    precision: 0,
    recall: 0,
    kaScore: 0,
  });

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

  const getResult = () => {
    // axios.get(`${SERVER_URL}/api/user/get-model`).then((res) => {
    //   console.log(res.data);
    // });
    setResult({
      accuracy: 98,
      precision: 95,
      recall: 92,
      kaScore: 97,
    });
  };

  const handleStartClick = () => {
    setIsModeOpen(true);
  };

  const handleModeSelect = (selectedMode: string) => {
    setIsModeOpen(false);
    if (selectedMode === "Games Mode") {
      router.push("/games?model=" + name);
    } else {
      router.push("/free?model=" + name);
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

  useEffect(() => {
    getResult();
  }, []);

  return (
    <div>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 transform transition-transform ease-in-out duration-300 scale-100">
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
            <strong> "Mulai" </strong> untuk memulai.
          </p>

          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">
              Hasil Kalibrasi
            </h3>
            <ul className="text-gray-600 space-y-2">
              <li>
                <span className="font-semibold">Akurasi:</span>{" "}
                {result.accuracy}%
              </li>
              <li>
                <span className="font-semibold">Presisi:</span>{" "}
                {result.precision}%
              </li>
              <li>
                <span className="font-semibold">Recall:</span> {result.recall}%
              </li>
              <li>
                <span className="font-semibold">KA Score:</span>{" "}
                {result.kaScore}
              </li>
            </ul>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleStartClick}
              className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out"
            >
              Mulai
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition duration-300 ease-in-out"
            >
              Tutup
            </button>
          </div>

          {isModeOpen && (
            <div className="absolute inset-0 flex items-center justify-center z-60 bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">
                  Pilih Mode
                </h3>
                <button
                  onClick={() => handleModeSelect("Games Mode")}
                  className="block w-full mb-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out"
                >
                  Games Mode
                </button>
                <button
                  onClick={() => handleModeSelect("Free Mode")}
                  className="block w-full px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-300 ease-in-out"
                >
                  Free Mode
                </button>
                <button
                  onClick={handleCancelMode}
                  className="block mt-4 mx-auto px-4 py-2  text-red-500 font-semibold rounded-lg hover:bg-red-600 hover:text-white transition duration-300 ease-in-out"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalCalibrationResult;
