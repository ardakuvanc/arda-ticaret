import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Heart, Lock, Mail, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup } = useStore();
    const navigate = useNavigate();

    const getErrorMessage = (error) => {
        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'E-posta veya şifre hatalı bitanem 🥺';
            case 'auth/email-already-in-use':
                return 'Bu e-posta zaten kullanılıyor ❤️ Giriş yapmayı dene.';
            case 'auth/weak-password':
                return 'Şifre çok kısa, biraz daha zor olsun 💪 (en az 6 karakter)';
            case 'auth/invalid-email':
                return 'Geçerli bir e-posta adresi girmelisin 💌';
            default:
                return 'Bir hata oluştu: ' + error.message;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
                toast.success('Hoş geldin aşkım! ❤️');
            } else {
                await signup(email, password, name);
                toast.success('Hesabın oluşturuldu! 🎉');
            }
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-love-50 to-purple-50 p-6">
            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border border-love-100">
                <div className="flex justify-center mb-6">
                    <div className="bg-love-100 p-4 rounded-full text-love-500 animate-pulse">
                        <Heart size={48} fill="currentColor" />
                    </div>
                </div>

                <h1 className="text-3xl font-hand font-bold text-center text-love-600 mb-2">
                    {isLogin ? 'Hoş Geldin' : 'Aramıza Katıl'}
                </h1>
                <p className="text-center text-gray-400 text-sm mb-8">
                    {isLogin ? 'Seni tekrar görmek ne güzel! 💖' : 'Aşk dolu dünyamıza kayıt ol 🌸'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">İsim</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-400">👤</span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-gray-50 rounded-xl py-3 pl-10 pr-4 text-sm border border-gray-100 outline-none focus:ring-2 focus:ring-love-200 transaction-all"
                                    placeholder="Senin adın ne?"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">E-posta</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-400"><Mail size={18} /></span>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-gray-50 rounded-xl py-3 pl-10 pr-4 text-sm border border-gray-100 outline-none focus:ring-2 focus:ring-love-200 transaction-all"
                                placeholder="ornek@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Şifre</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-400"><Lock size={18} /></span>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-gray-50 rounded-xl py-3 pl-10 pr-4 text-sm border border-gray-100 outline-none focus:ring-2 focus:ring-love-200 transaction-all"
                                placeholder="******"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-love-500 text-white font-bold py-3.5 rounded-xl hover:bg-love-600 transition-colors shadow-lg shadow-love-200 flex items-center justify-center gap-2 "
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-gray-500 hover:text-love-500 transition-colors"
                    >
                        {isLogin ? 'Hesabın yok mu? Kayıt Ol' : 'Zaten hesabın var mı? Giriş Yap'}
                    </button>
                </div>
            </div>

            <p className="mt-8 text-xs text-gray-400 opacity-60">Arda Kuvancı tarafından aşkla yapıldı ❤️</p>
        </div>
    );
}
