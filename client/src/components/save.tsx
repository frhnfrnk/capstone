"use client";
import React, { useState } from "react";

const save = () => {
  const [animation, setAnimation] = useState("Stop Animation");
  return (
    <div>
      <div className="absolute top-0 left-0 flex flex-col justify-center gap-4 p-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setAnimation("Genggam")}
        >
          Genggam
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setAnimation("Hook Fist")}
        >
          Hook Fist
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setAnimation("Index Flexion")}
        >
          Index Flexion
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setAnimation("Open")}
        >
          Open
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setAnimation("Thumb Flexion")}
        >
          Thumb Flexion
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setAnimation("Stop Animation")}
        >
          Stop Animation
        </button>
      </div>
    </div>
  );
};

export default save;
