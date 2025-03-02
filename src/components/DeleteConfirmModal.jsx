import { useState } from 'react';
import Modal from './Modal';
import { FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm }) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();

    if (!password.trim()) {
      toast.error('Lütfen şifrenizi girin');
      return;
    }

    onConfirm(password);
    setPassword('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3 text-red-500">
          <FaExclamationTriangle size={24} />
          <span>Hesabı Sil</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="text-gray-300 space-y-4">
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
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Onaylamak için şifrenizi girin
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-red-500 text-white"
            placeholder="Şifreniz"
            required
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Hesabı Sil
          </button>
        </div>
      </form>
    </Modal>
  );
} 