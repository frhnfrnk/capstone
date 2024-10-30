import React from "react";

const Loading = () => {
  return (
    <div className="inset-0 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};

export default Loading;
