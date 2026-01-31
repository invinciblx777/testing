"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { toast } from "sonner"; // Assuming sonner is installed as per package.json

export default function AdminLogin() {
    const [loading, setLoading] = useState(false);
    const { login } = useStore();
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Mock login for frontend-only mode
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate returning promise

            // Allow any credentials for now since backend is removed
            if (formData.email && formData.password) {
                login({
                    name: "Admin",
                    email: formData.email,
                    role: "admin"
                });
                toast.success("Welcome back!");
                router.push("/admin/dashboard");
                router.refresh();
            } else {
                throw new Error("Please enter email and password");
            }

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
            <div className="w-full max-w-md p-8 bg-background rounded-lg shadow-lg border border-border">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-serif font-bold">Admin Login</h1>
                    <p className="text-muted-foreground mt-2">Enter your credentials to access the panel</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="Enter admin email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <Button className="w-full" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-primary">Return to Store</Link>
                </div>
            </div>
        </div>
    );
}
