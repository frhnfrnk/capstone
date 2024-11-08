import React from "react";

const Loading = ({ w, h }: any) => {
  return (
    <div className="inset-0 flex items-center justify-center">
      <div
        className={`animate-spin rounded-full ${h} ${w} border-t-2 border-b-2 border-primary`}
      ></div>
    </div>
  );
};

export default Loading;
