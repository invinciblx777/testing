"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc"; // Install react-icons if needed
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useStore();

    const [isLogin, setIsLogin] = useState(true); // Toggle Login vs Signup
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate Network Delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Demo Data Only (Prevent Real Auth for Now)
        login({
            name: isLogin ? "Returning User" : "New User",
            email: email,
            role: "customer",
        });

        setIsLoading(false);
        router.push("/");
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        // Simulate Delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // Mock Action
        setIsLoading(false);
        alert("Google Login Integration coming soon!");
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
            {/* 
        --------------------------------------------------
        LUXURY BACKGROUND GRADIENT
        Soft Pink / Blush / Mauve - Slow Movement
        --------------------------------------------------
      */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100 via-stone-100 to-rose-50 opacity-90" />

            {/* Subtle animated blobs for depth */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-200/30 rounded-full blur-[120px] animate-pulse delay-700" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" />

            {/* 
        --------------------------------------------------
        GLASS MORPHISM CARD
        --------------------------------------------------
      */}
            <div className="relative z-10 w-full max-w-[420px] mx-4 p-8 md:p-12 rounded-3xl border border-white/40 shadow-[0_8px_32px_0_rgba(131,24,67,0.05)] backdrop-blur-xl bg-white/40 flex flex-col items-center animate-in fade-in zoom-in-95 duration-1000">

                {/* LOGO */}
                <div className="mb-8 flex flex-col items-center">
                    <img
                        src="/kurtis-logo-large.png"
                        alt="Kurtis Boutique"
                        className="w-40 h-auto object-contain drop-shadow-sm opacity-90"
                    />
                </div>

                {/* HEADINGS */}
                <div className="text-center space-y-2 mb-8">
                    <h1 className="font-serif text-2xl md:text-3xl text-primary font-medium tracking-wide">
                        {isLogin ? "Welcome Back" : "Join the Luxury"}
                    </h1>
                    <p className="text-sm text-muted-foreground font-light tracking-wide">
                        {isLogin ? "Sign in to access your wishlist & orders" : "Create an account to start your journey"}
                    </p>
                </div>

                {/* 
            GOOGLE LOGIN BUTTON 
            Using simple SVG if react-icons not avail, but trying react-icons first.
            Fallback: SVG
        */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white/70 hover:bg-white/90 border border-white/60 text-stone-700 font-medium py-3 rounded-full transition-all duration-300 shadow-sm hover:shadow-md group"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            {/* Google Icon SVG */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span className="group-hover:text-black transition-colors">Continue with Google</span>
                        </>
                    )}
                </button>

                {/* DIVIDER */}
                <div className="w-full flex items-center gap-4 my-6 opacity-60">
                    <div className="h-[1px] flex-1 bg-stone-300"></div>
                    <span className="text-xs text-stone-400 font-light uppercase tracking-widest">or email</span>
                    <div className="h-[1px] flex-1 bg-stone-300"></div>
                </div>

                {/* EMAIL FORM */}
                <form onSubmit={handleAuth} className="w-full space-y-4">
                    <div className="space-y-1">
                        <input
                            type="email"
                            required
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/50 border border-stone-200 focus:border-primary/50 focus:bg-white/80 rounded-xl px-4 py-3 outline-none text-stone-800 placeholder:text-stone-400 transition-all duration-300 text-sm"
                        />
                    </div>

                    <div className="relative space-y-1">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/50 border border-stone-200 focus:border-primary/50 focus:bg-white/80 rounded-xl px-4 py-3 outline-none text-stone-800 placeholder:text-stone-400 transition-all duration-300 text-sm pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 text-base font-medium transition-transform active:scale-[0.98] shadow-lg shadow-primary/20 mt-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}
                    </Button>
                </form>

                {/* TOGGLE */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-stone-500 hover:text-primary transition-colors duration-300 font-light"
                    >
                        {isLogin ? (
                            <>New to Kurtis Boutique? <span className="font-medium underline underline-offset-4 decoration-primary/30">Create an account</span></>
                        ) : (
                            <>Already a member? <span className="font-medium underline underline-offset-4 decoration-primary/30">Sign in</span></>
                        )}
                    </button>
                </div>

                {/* FOOTER LINKS */}
                <div className="mt-8 flex gap-6 text-xs text-stone-400 font-light">
                    <Link href="#" className="hover:text-stone-600 transition-colors">Privacy Policy</Link>
                    <Link href="#" className="hover:text-stone-600 transition-colors">Terms of Service</Link>
                </div>

            </div>
        </div>
    );
}
