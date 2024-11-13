"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface User {
  id: string; // Assuming user has an id, modify as necessary
  name: string; // Assuming user has a name, modify as necessary
}

interface ConnectionState {
  board: string;
  error: string;
  success: boolean;
}

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<string>("");
  const [modelExist, setModelExist] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

  const handleOpenModal = (mode: string) => {
    getUserExist();
    setIsModalOpen(true);
    setMode(mode);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMode("");
  };

  const getUserExist = () => {
    setLoading(true);
    axios
      .get(`${SERVER_URL}/api/model/check`)
      .then((res) => {
        setModelExist(res.data.status);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCalibration = () => {
    if (mode) {
      window.localStorage.setItem("mode", mode);
      router.push(`/calibration/`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <img src="/Logo/nobg.png" alt="Logo" className="w-64 -mt-12" />
      <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center font-mono">
        Post-Stroke Rehabilitation <br />
        with EEG 3D Animation
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Pilih mode yang akan digunakan
      </p>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => handleOpenModal("Games")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Games Mode
        </button>
        <button
          onClick={() => handleOpenModal("Free")}
          className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Free Mode
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {mode} Mode
            </h2>
            {modelExist ? (
              <p className="text-gray-600 mb-4">
                Silahkan lakukan kalibrasi untuk memulai mode {mode}.
              </p>
            ) : (
              <p className="text-gray-600 mb-4">
                Anda belum memiliki model machine learning. Silahkan lakukan
                pengambilan data EEG terlebih dahulu.
              </p>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-300 ease-in-out"
              >
                Batal
              </button>
              {modelExist ? (
                <button
                  onClick={handleCalibration}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Kalibrasi
                </button>
              ) : (
                <button
                  onClick={() => router.push("/collect-data")}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Ambil Data
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
