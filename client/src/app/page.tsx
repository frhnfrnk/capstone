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
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [userExist, setUserExist] = useState<string[]>([]);
  const [mode, setMode] = useState<string>("");
  const [connection, setConnection] = useState<ConnectionState>({
    board: "",
    error: "",
    success: false,
  });
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

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedUser(e.target.value);

  const checkConnection = () => {
    setLoading(true);
    axios
      .get(`${SERVER_URL}/api/mindrove/check_connection`)
      .then((res) => {
        setConnection({
          board: res.data.board,
          error: "",
          success: true,
        });
      })
      .catch((err) => {
        setConnection({
          board: "",
          error: err.response.data.error,
          success: false,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getUserExist = () => {
    setLoading(true);
    axios
      .get(`${SERVER_URL}/api/user`)
      .then((res) => {
        setUserExist(res.data.user);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSelectUser = () => {
    if (selectedUser) {
      if (mode === "Games") {
        router.push(`/games?user=${selectedUser}`);
      } else {
        router.push(`/free?user=${selectedUser}`);
      }
    }
  };

  useEffect(() => {
    if (!connection.success) {
      checkConnection();
    }
  }, []);

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

      <p className="mt-2">
        Connect to:{" "}
        <span className="font-bold underline">
          {connection.success ? connection.board : "Not Connected"}
        </span>
      </p>
      {!connection.success && !loading && (
        <p className="text-center text-red-500">{connection.error}</p>
      )}
      {loading && <p className="text-center text-blue-500">Loading...</p>}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {mode} Mode
            </h2>
            <label className="block text-gray-700 mb-2" htmlFor="model-select">
              Pilih user yang akan digunakan:
            </label>
            <select
              id="model-select"
              value={selectedUser}
              onChange={handleUserChange}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring focus:ring-blue-500"
            >
              <option value="">Pilih User</option>
              {userExist.map((user, index) => (
                <option className="p-2" key={index} value={user}>
                  {user}
                </option>
              ))}
            </select>
            <div className="flex justify-end items-center mb-4">
              <button
                onClick={() => router.push("/calibration")}
                className="text-blue-600 hover:underline"
              >
                Tambah User Baru
              </button>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-300 ease-in-out"
              >
                Batal
              </button>
              <button
                onClick={handleSelectUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out"
              >
                Pilih
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
