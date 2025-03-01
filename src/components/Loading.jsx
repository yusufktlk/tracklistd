import { FaCompactDisc } from 'react-icons/fa';

export default function Loading({ size = "default" }) {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-8 h-8",
    large: "w-12 h-12"
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <FaCompactDisc 
        className={`${sizeClasses[size]} text-indigo-400 animate-spin`} 
      />
      <span className="mt-2 text-sm text-gray-400">Yükleniyor...</span>
    </div>
  );
} 