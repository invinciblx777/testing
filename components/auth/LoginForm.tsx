"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function LoginForm() {
    const supabase = getSupabaseClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            router.refresh();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An error occurred during sign in");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleEmailLogin} className="w-full space-y-4">
            <div className="space-y-2">
                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-4 bg-white/70 border border-white/60 rounded-full text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm"
                />
            </div>
            <div className="space-y-2">
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-5 py-4 bg-white/70 border border-white/60 rounded-full text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary/90 hover:bg-primary text-white font-medium py-4 rounded-full transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    "Sign In"
                )}
            </button>
        </form>
    );
}
