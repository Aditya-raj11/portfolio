import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/admin');
        } catch (err) {
            setError('Failed to login. Check your email and password.');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="glass-panel p-8 rounded-xl w-full max-w-md text-white">
                <h2 className="text-3xl font-heading text-glossy mb-6 text-center">Admin Login</h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="text-gray-400 text-sm font-medium mb-1 block">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-white outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-gray-400 text-sm font-medium mb-1 block">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-white outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full btn-3d py-3 rounded-lg flex items-center justify-center gap-2"
                    >
                        <LogIn size={20} /> Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
