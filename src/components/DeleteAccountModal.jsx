import { FaExclamationTriangle } from 'react-icons/fa';

export default function DeleteAccountModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 text-red-500 mb-4">
          <FaExclamationTriangle size={24} />
          <h2 className="text-xl font-semibold">Hesabı Sil</h2>
        </div>
        
        <div className="text-gray-300 mb-6 space-y-4">
          <p>
            Hesabınızı silmek üzeresiniz. Bu işlem geri alınamaz ve aşağıdaki verileriniz kalıcı olarak silinecektir:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li>Profil bilgileriniz</li>
            <li>Favori albümleriniz</li>
            <li>Dinlediğiniz albümler</li>
            <li>Yorumlarınız</li>
            <li>Spotify bağlantınız</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            Hesabı Sil
          </button>
        </div>
      </div>
    </div>
  );
} 