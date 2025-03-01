import { useState } from 'react';
import { FaUser } from 'react-icons/fa';

export default function Avatar({ src, alt, size = "default" }) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    small: "w-6 h-6",
    default: "w-10 h-10",
    large: "w-20 h-20"
  };

  if (!src || imageError) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-700 rounded-full flex items-center justify-center`}>
        <FaUser className="text-gray-400" size={size === "large" ? 32 : size === "default" ? 20 : 12} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setImageError(true)}
      className={`${sizeClasses[size]} rounded-full object-cover`}
    />
  );
} 