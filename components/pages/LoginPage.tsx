
import React, { useState } from 'react';
import { useNavigate, useLocation, NavLink, Navigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { KeyIcon, EyeIcon, EyeSlashIcon } from '../icons/Icons';
import { useAuth } from '../auth/AuthContext';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(location.state?.message || null);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            navigate('/dashboard');
        }

        setLoading(false);
    };
    
    const handlePasswordReset = async () => {
        if (!email) {
            setError("Please enter your email address to reset your password.");
            return;
        }
        setError(null);
        setMessage(null);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage("Password reset link sent! Please check your email.");
        }
    }
    
    if (user) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="w-full max-w-md space-y-8">
                <div>
                     <img src="https://i.postimg.cc/C1wJWDR3/Professional-logo-for-Indian-Legal-Acts.png" alt="Indian Legal Acts Logo" className="mx-auto h-20 w-auto" />
                    <h2 className="mt-6 text-center text-3xl font-bold font-heading tracking-tight text-navy dark:text-white">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-dark-gray dark:text-gray-400">
                        Or{' '}
                        <NavLink to="/signup" className="font-medium text-gold hover:text-yellow-600">
                            create a new account
                        </NavLink>
                    </p>
                </div>

                {error && <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-md text-sm"><p>{error}</p></div>}
                {message && <div className="bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 text-green-700 dark:text-green-200 p-4 rounded-md text-sm"><p>{message}</p></div>}
                
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-light-neutral dark:bg-gray-800 text-dark-gray dark:text-gray-200 placeholder-gray-500 focus:z-10 focus:border-gold focus:outline-none focus:ring-gold sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password-input" className="sr-only">Password</label>
                            <input
                                id="password-input"
                                name="password"
                                type={passwordVisible ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-light-neutral dark:bg-gray-800 text-dark-gray dark:text-gray-200 placeholder-gray-500 focus:z-10 focus:border-gold focus:outline-none focus:ring-gold sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setPasswordVisible(!passwordVisible)}
                            >
                                {passwordVisible ? (
                                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                                ) : (
                                    <EyeIcon className="h-5 w-5 text-gray-500" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold" />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-dark-gray dark:text-gray-300">Remember me</label>
                        </div>
                        <div className="text-sm">
                            <button type="button" onClick={handlePasswordReset} className="font-medium text-gold hover:text-yellow-600">Forgot your password?</button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-navy dark:bg-gold py-2 px-4 text-sm font-semibold text-white dark:text-navy hover:bg-opacity-90 dark:hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:opacity-50"
                        >
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <KeyIcon className="h-5 w-5 text-gold dark:text-navy" />
                            </span>
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>

                        <button
                            type="button"
                            onClick={async () => {
                                setEmail('advocate.demo@legal.in');
                                setPassword('Demo@1234');
                                setLoading(true);
                                setError(null);
                                const { error } = await supabase.auth.signInWithPassword({
                                    email: 'advocate.demo@legal.in',
                                    password: 'Demo@1234',
                                });
                                if (error) {
                                    setError(error.message);
                                } else {
                                    navigate('/dashboard');
                                }
                                setLoading(false);
                            }}
                            disabled={loading}
                            className="w-full flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-4 text-sm font-semibold text-dark-gray dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
                        >
                            ⚡ Quick Demo Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
