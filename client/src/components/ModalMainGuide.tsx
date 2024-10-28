"use client";
import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";

const ModalGuide = ({ setIsOpen, isOpen, start }: any) => {
  if (!isOpen) return null;

  const onClose = () => {
    setIsOpen(false);
    start();
  };

  const slides = [
    {
      content: (
        <>
          <div className="h-full flex flex-col justify-center items-center px-5">
            <h1 className="text-3xl font-bold mb-4">Panduan Penggunaan</h1>
            <p className="text-lg text-gray-500 text-center">
              Ikuti langkah-langkah berikut untuk menggunakan aplikasi ini.
            </p>
          </div>
        </>
      ),
    },
    {
      content: (
        <>
          <div className="h-full flex flex-col justify-center items-center px-5">
            <h1 className="text-3xl font-bold mb-4">Langkah 1</h1>
            <img
              src="/guide/wear.jpg"
              alt="Wear Headset"
              className="my-4 w-[90%] rounded-lg"
            />
            <p className="text-lg text-gray-500 text-center">
              Pasang headset EEG pada kepala Anda dengan benar.
            </p>
          </div>
        </>
      ),
    },
    {
      content: (
        <>
          <div className="h-full flex flex-col justify-center items-center px-5">
            <h1 className="text-3xl font-bold mb-4">Langkah 2</h1>
            <img
              src="/guide/sit.jpg"
              alt="Sit Comfortably"
              className="my-4 w-[90%] rounded-lg"
            />
            <p className="text-lg text-gray-500 text-center">
              Duduklah dengan nyaman dan pastikan lingkungan sekitar Anda
              tenang.
            </p>
          </div>
        </>
      ),
    },
    {
      content: (
        <>
          <div className="h-full flex flex-col justify-center items-center px-5">
            <h1 className="text-3xl font-bold mb-4">Langkah 3</h1>
            <img
              src="/guide/relax.jpg"
              alt="Relax and Focus"
              className="my-4 w-[90%] rounded-lg"
            />
            <p className="text-lg text-gray-500 text-center">
              Santai dan fokuskan pikiran Anda pada objek yang ditampilkan.
            </p>

            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              Mulai
            </button>
          </div>
        </>
      ),
    },
  ];

  useEffect(() => {
    // Tambahkan logika jika diperlukan saat halaman dimuat
  }, []);

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

export default ModalGuide;
