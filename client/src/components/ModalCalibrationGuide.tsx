"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import axios from "axios";

interface ModalCalibrationGuideProps {
  setIsOpen: (value: boolean) => void;
  isOpen: boolean;
  setUsername: (value: string) => void;
}

const ModalCalibrationGuide = ({
  setIsOpen,
  isOpen,
  setUsername,
}: ModalCalibrationGuideProps) => {
  if (!isOpen) return null;
  const [name, setName] = useState("");
  const [isAgree, setIsAgree] = useState(false);
  const [canStart, setCanStart] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [userExist, setUserExist] = useState<string[]>([]);
  const [isUserNameExist, setIsUserNameExist] = useState(false);

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    const isExist = userExist.includes(e.target.value);
    setIsUserNameExist(isExist);
    setErrorMessage(isExist ? "Nama sudah digunakan" : "");
  };

  const getUserExist = () => {
    axios
      .get(`${SERVER_URL}/api/user`)
      .then((res) => {
        setUserExist(res.data.user);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getUserExist();
  }, []);

  const onClose = () => {
    setUsername(name);
    setIsOpen(false);
  };

  const slides = [
    {
      content: (
        <div className="flex flex-col items-center justify-center h-full px-5">
          <h1 className="text-4xl font-bold mb-4 text-blue-600">
            Panduan Kalibrasi
          </h1>
          <p className="text-lg text-gray-700 text-center">
            Ikuti langkah-langkah berikut untuk melakukan kalibrasi.
          </p>
        </div>
      ),
    },
    {
      content: (
        <div className="flex flex-col items-center justify-center h-full px-5">
          <h1 className="text-3xl font-bold mb-4">Persiapan</h1>
          <p className="text-lg text-gray-700 text-center mb-2">
            Pasang headset EEG pada kepala Anda dengan benar. Duduklah dengan
            nyaman dan pastikan lingkungan sekitar Anda tenang.
          </p>
          <img
            src="/guide/wear.jpg"
            alt="Wear Headset"
            className="my-4 w-[50%] rounded-lg shadow-lg border border-gray-300"
          />
        </div>
      ),
    },
    {
      content: (
        <div className="flex flex-col items-center justify-center h-full px-5">
          <h1 className="text-3xl font-bold mb-4">Video</h1>
          <p className="text-lg text-gray-700 text-center mb-2">
            Akan ditampilkan video yang harus Anda lihat. Pastikan Anda fokus
            pada video tersebut.
          </p>
          <img
            src="/guide/sit.jpg"
            alt="Sit Comfortably"
            className="my-4 w-[90%] rounded-lg shadow-lg border border-gray-300"
          />
        </div>
      ),
    },
    {
      content: (
        <div className="flex flex-col items-center justify-center h-full px-5">
          <h1 className="text-3xl font-bold mb-4">Fokus</h1>
          <p className="text-lg text-gray-700 text-center mb-2">
            Anda akan diminta untuk fokus dan bayangkan gerakan tangan yang
            sesuai dengan video yang ditampilkan.
          </p>
          <img
            src="/guide/relax.jpg"
            alt="Relax and Focus"
            className="my-4 w-[90%] rounded-lg shadow-lg border border-gray-300"
          />
        </div>
      ),
    },
    {
      content: (
        <div className="flex flex-col items-center justify-center h-full px-5">
          <h1 className="text-3xl font-bold mb-4">Jeda</h1>
          <p className="text-lg text-gray-700 text-center mb-2">
            Saat jeda, Anda dapat beristirahat sejenak sebelum fokus pada
            perintah selanjutnya.
          </p>
          <img
            src="/guide/relax.jpg"
            alt="Relax and Focus"
            className="my-4 w-[90%] rounded-lg shadow-lg border border-gray-300"
          />
        </div>
      ),
    },
    {
      content: (
        <div className="flex flex-col items-center justify-center h-full px-5">
          <h1 className="text-3xl font-bold mb-4">Konfirmasi</h1>
          <div className="flex flex-col items-center gap-5 w-full">
            <label className="flex items-center gap-2 userSelect">
              <input
                type="checkbox"
                onChange={(e) => setIsAgree(e.target.checked)}
                checked={isAgree}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="text-lg text-gray-700">
                Saya telah membaca dan memahami panduan kalibrasi.
              </span>
            </label>

            <div className="flex gap-5 items-center justify-center">
              <input
                type="text"
                placeholder="Masukkan nama Anda"
                value={name}
                onChange={handleName}
                className="max-w-xs px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={onClose}
                disabled={!canStart}
                className={`px-6 py-2 rounded-lg shadow-lg transition duration-300 ease-in-out
                  ${
                    canStart
                      ? "bg-blue-500 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Mulai
              </button>
            </div>

            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (name && isAgree && !isUserNameExist) {
      setCanStart(true);
    } else setCanStart(false);
  }, [name, isAgree]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl h-3/4 overflow-hidden">
        <Swiper
          pagination={{ clickable: true }}
          navigation
          modules={[Navigation, Pagination]}
          className="h-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide
              key={index}
              className="flex flex-col justify-center items-center p-8"
            >
              {slide.content}
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          onClick={onClose} // Tombol untuk menutup modal
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          &times; {/* Ikon untuk menutup modal */}
        </button>
      </div>
    </div>
  );
};

export default ModalCalibrationGuide;
