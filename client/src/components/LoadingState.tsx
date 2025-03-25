import React from "react";

export default function LoadingState() {
  return (
    <div className="max-w-2xl mx-auto mt-16 text-center">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full mb-4 animate-spin"></div>
        <h3 className="text-xl font-medium text-neutral-800 mb-2">Researching...</h3>
        <p className="text-neutral-700 opacity-70">
          We're looking for the most recent and relevant information on your topic.
        </p>
      </div>
    </div>
  );
}
