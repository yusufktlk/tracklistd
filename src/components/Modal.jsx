import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, onConfirm, title, message }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
        <p className="text-gray-300 mb-6">{message}</p>
        
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
} 