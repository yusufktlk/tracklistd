import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, actions, size = "md" }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-gray-800 rounded-lg p-6 w-full mx-4 ${"max-w-"+size}`}>
        {title && <div className="mb-4">{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}
