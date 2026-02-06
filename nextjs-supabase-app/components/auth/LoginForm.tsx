'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Create a timeout promise that rejects after 15 seconds
            const timeoutPromise = new Promise<{ error: { message: string } | null }>((_, reject) => {
                setTimeout(() => reject(new Error('Request timed out. Please check your internet connection.')), 15000);
            });

            // Race the auth request against the timeout
            const { error } = await Promise.race([
                supabase.auth.signInWithPassword({
                    email,
                    password,
                }),
                timeoutPromise as Promise<{ error: { message: string } | null; data?: any }>,
            ]);

            if (error) {
                setError(error.message);
                setLoading(false); // Make sure to stop loading on error
                return;
            }

            router.push(redirectTo || '/dashboard');
            router.refresh();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email address
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="you@example.com"
                    required
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    placeholder="••••••••"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
            >
                {loading ? (
                    <span className="spinner" />
                ) : (
                    'Sign in'
                )}
            </button>
        </form>
    );
}
