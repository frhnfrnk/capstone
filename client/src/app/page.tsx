"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [userExist, setUserExist] = useState([]);
  const [connection, setConnection] = useState({
    board: "",
    error: "",
    success: false,
  });

  const handleOpenModal = () => {
    getUserExist();
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);
  const handleUserChange = (e: any) => setSelectedUser(e.target.value);

  const checkConnection = () => {
    axios
      .get("http://127.0.0.1:5000/api/mindrove/check_connection")
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
          error: err.message,
          success: false,
        });
      });
  };

  const getUserExist = () => {
    axios
      .get("http://localhost:5000/api/user")
      .then((res) => {
        setUserExist(res.data.user);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSelectUser = () => {
    if (selectedUser) {
      router.push(`/main?user=${selectedUser}`); // Mengirimkan model yang dipilih sebagai query
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        EEG Data 3D Hand Animation
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Pilih user untuk memulai animasi tangan berbasis data EEG.
      </p>
      <div className="flex space-x-4">
        <button
          onClick={handleOpenModal}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out"
        >
          Pilih User
        </button>
        <button className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition duration-300 ease-in-out">
          New User
        </button>
      </div>

      <p className="mt-2">
        Connect to:{" "}
        <span className="font-bold underline">
          {connection.success ? connection.board : "Not Connected"}
        </span>
      </p>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Pilih User
            </h2>
            <label className="block text-gray-700 mb-2" htmlFor="model-select">
              User yang akan digunakan:
            </label>
            <select
              id="model-select"
              value={selectedUser}
              onChange={handleUserChange}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none"
            >
              <option value="">Pilih User</option>
              {userExist.map((user: any, index: any) => (
                <option key={index} value={user}>
                  {user}
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  handleSelectUser();
                  handleCloseModal();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
