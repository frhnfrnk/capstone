"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";

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

  const onClose = () => {
    setUsername(name);
    setIsOpen(false);
  };

  const slides = [
    {
      content: (
        <>
          <div className="h-full flex flex-col justify-center items-center px-5">
            <h1 className="text-3xl font-bold mb-4">Panduan Kalibrasi</h1>
            <p className="text-lg text-gray-500 text-center">
              Ikuti langkah-langkah berikut untuk melakukan kalibrasi.
            </p>
          </div>
        </>
      ),
    },
    {
      content: (
        <>
          <div className="h-full flex flex-col justify-center items-center px-5">
            <h1 className="text-3xl font-bold mb-4">Persiapan</h1>
            <p className="text-lg text-gray-500 text-center">
              Pasang headset EEG pada kepala Anda dengan benar. Duduklah dengan
              nyaman dan pastikan lingkungan sekitar Anda Santai dan fokuskan
              pikiran Anda pada objek yang ditampilkan. tenang.
            </p>
            <img
              src="/guide/wear.jpg"
              alt="Wear Headset"
              className="my-4 w-[90%] rounded-lg"
            />
          </div>
        </>
      ),
    },
    {
      content: (
        <>
          <div className="h-full flex flex-col justify-center items-center px-5">
            <h1 className="text-3xl font-bold mb-4">Video</h1>
            <p className="text-lg text-gray-500 text-center">
              Akan ditampilkan video yang harus Anda lihat. Pastikan Anda
              fokuskan pandangan Anda pada video tersebut. Ikuti instruksi yang
              diberikan.
            </p>
            <img
              src="/guide/sit.jpg"
              alt="Sit Comfortably"
              className="my-4 w-[90%] rounded-lg"
            />
          </div>
        </>
      ),
    },
    {
      content: (
        <>
          <div className="h-full flex flex-col justify-center items-center px-5">
            <h1 className="text-3xl font-bold mb-4">Fokus</h1>

            <p className="text-lg text-gray-500 text-center">
              Anda akan diminta focus dan bayangkan gerakan tangan yang sesuai
              dengan video yang ditampilkan selama waktu tertentu.
            </p>
            <img
              src="/guide/relax.jpg"
              alt="Relax and Focus"
              className="my-4 w-[90%] rounded-lg"
            />
          </div>
        </>
      ),
    },
    {
      content: (
        <>
          <div className="h-full flex flex-col justify-center items-center px-5">
            <h1 className="text-3xl font-bold mb-4">Jeda</h1>

            <p className="text-lg text-gray-500 text-center">
              Saat jeda, Anda dapat beristirahat sejenak sebelum focus pada
              perintah selanjutnya.
            </p>
            <img
              src="/guide/relax.jpg"
              alt="Relax and Focus"
              className="my-4 w-[90%] rounded-lg"
            />
          </div>
        </>
      ),
    },
    {
      content: (
        <>
          <div className="h-full flex flex-col justify-center items-center px-5">
            <div className="flex flex-col items-center gap-5 w-full">
              {/* Checkbox untuk persetujuan */}
              <div className="flex items-center justify-center gap-5">
                <label className="text-lg text-gray-500 text-center flex gap-2 items-center userSelect">
                  <input
                    type="checkbox"
                    onChange={(e) => setIsAgree(e.target.checked)}
                    checked={isAgree}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  Saya telah membaca dan memahami panduan kalibrasi.
                </label>
              </div>

              {/* Tombol untuk mulai */}
              <div className="flex gap-5 items-center justify-center">
                <input
                  type="text"
                  placeholder="Masukkan nama Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="max-w-xs px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={onClose}
                  disabled={!canStart}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out
          disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mulai
                </button>
              </div>

              {errorMessage && (
                <p className="text-red-500 text-sm">{errorMessage}</p>
              )}
            </div>
          </div>
        </>
      ),
    },
  ];

  useEffect(() => {
    if (name && isAgree) {
      setCanStart(true);
    } else setCanStart(false);
  }, [name, isAgree]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl h-3/4">
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
