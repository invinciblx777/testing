"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function SignupPage() {
    const router = useRouter();
    const { login } = useStore();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock signup delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock successful signup and login
        login({
            name: name,
            email: email,
            role: 'customer',
        });

        setIsLoading(false);
        router.push("/"); // Redirect to home
    };

    return (
        <div className="min-h-screen bg-background/60 backdrop-blur-sm flex flex-col">
            <Navbar />

            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md space-y-8 bg-background/80 backdrop-blur-md p-8 rounded-lg shadow-xl border border-border/50">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-serif font-medium">Create Account</h1>
                        <p className="text-muted-foreground">Join us for exclusive benefits</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">Password</label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Enter your password"
                            />
                        </div>

                        <Button type="submit" className="w-full text-lg h-12" disabled={isLoading}>
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-foreground font-medium hover:underline">
                            Sign in
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
