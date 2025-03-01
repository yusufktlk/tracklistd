import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error('Firebase Error:', err.code, err.message);
      
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Geçersiz email adresi');
          break;
        case 'auth/user-disabled':
          setError('Bu hesap devre dışı bırakılmış');
          break;
        case 'auth/user-not-found':
          setError('Bu email adresiyle kayıtlı hesap bulunamadı');
          break;
        case 'auth/wrong-password':
          setError('Hatalı şifre');
          break;
        default:
          setError('Giriş yapılırken bir hata oluştu: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-white text-center">Giriş Yap</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Şifre
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition duration-200 disabled:opacity-50"
          >
            Giriş Yap
          </button>
        </form>

        <p className="mt-4 text-center text-gray-400">
          Hesabın yok mu?{' '}
          <Link to="/register" className="text-purple-500 hover:text-purple-400">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
} 