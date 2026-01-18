import React from 'react';
import { ArrowLeftIcon } from './Icons';

const BackButton = ({ onClick, text = "Back to Home" }) => {
  return (
    <button
      onClick={onClick}
      className="mb-6 md:mb-8 inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 rounded-lg font-medium"
    >
      <ArrowLeftIcon />
      <span>{text}</span>
    </button>
  );
};

export default BackButton;
