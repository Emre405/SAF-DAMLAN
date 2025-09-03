import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { Mail, Lock, Eye, EyeOff, Droplet, Factory, AlertCircle } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!navigator.onLine) {
        const offlineUser = localStorage.getItem('offlineUser');
        if (offlineUser) {
          const userData = JSON.parse(offlineUser);
          if (userData.email === email) {
            console.log('OFFLINE: Kullanici localStorage dan dogrulandi');
            onLoginSuccess();
            return;
          }
        }
        setError('Internet baglantisi yok. Daha once giris yapmis olmaniz gerekiyor.');
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (error) {
      console.error('Giris hatasi:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('Bu e-posta adresi ile kayitli kullanici bulunamadi.');
          break;
        case 'auth/wrong-password':
          setError('Hatali sifre girdiniz.');
          break;
        case 'auth/invalid-email':
          setError('Gecersiz e-posta adresi.');
          break;
        case 'auth/too-many-requests':
          setError('Cok fazla basarisiz deneme. Lutfen daha sonra tekrar deneyin.');
          break;
        case 'auth/network-request-failed':
          setError('Internet baglantisi hatasi. Lutfen baglantinizi kontrol edin.');
          break;
        default:
          setError('Giris yapilirken bir hata olustu. Lutfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg">
            <Droplet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SAF DAMLA</h1>
          <p className="text-gray-600">Zeytinyagi Fabrikasi Yonetim Sistemi</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Sisteme Giris
            </h2>
            <p className="text-gray-600">
              Yonetim paneline erismek icin giris bilgilerinizi girin
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="E-posta adresinizi girin"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Sifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Sifrenizi girin"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Giris Yapiliyor...
                </>
              ) : (
                <>
                  <Factory className="w-5 h-5 mr-2" />
                  Sisteme Giris Yap
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2024 SAF DAMLA Zeytinyagi Fabrikasi</p>
          <p className="mt-1">Guvenli ve guvenilir yonetim sistemi</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 