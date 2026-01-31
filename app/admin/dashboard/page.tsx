"use client";
import React, { useEffect, useState } from 'react';
import { useStore } from "@/lib/store";

export default function AdminDashboard() {
    const orders = useStore(state => state.orders || []);
    const [productsCount, setProductsCount] = useState<number | null>(null);

    useEffect(() => {
        // Fetch simple stats
        fetch('/api/products?limit=1')
            .then(res => res.json())
            .then(data => {
                if (data.pagination) setProductsCount(data.pagination.total);
            })
            .catch(console.error);
    }, []);

    // Safe date formatter
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return "Invalid Date";
            }
            return date.toLocaleDateString();
        } catch (e) {
            return "Date Error";
        }
    };

    const safeOrders = Array.isArray(orders) ? orders : [];
    const totalSales = safeOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    const activeOrders = safeOrders.filter(o => o.status === 'Pending' || o.status === 'In Transit' || o.status === 'Shipped').length;

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-serif font-bold">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Sales (Est)", value: `₹${totalSales.toLocaleString()}`, change: safeOrders.length > 0 ? "Local Orders" : "No Data" },
                    { label: "Active Orders", value: activeOrders.toString(), change: "" },
                    { label: "Total Products", value: productsCount !== null ? productsCount.toString() : "...", change: "Live" },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-background p-6 rounded-lg border border-border shadow-sm">
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold">{stat.value}</span>
                            {stat.change && <span className="text-green-600 text-sm font-medium">{stat.change}</span>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-background rounded-lg border border-border p-6 min-h-[400px]">
                <h3 className="text-lg font-medium mb-4">Recent Orders (Local Testing)</h3>
                {/* Note: In real app, this should fetch from /api/orders */}
                {safeOrders.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                        No orders yet.
                    </div>
                ) : (
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3">Order ID</th>
                                    <th className="px-6 py-3">Customer</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {safeOrders.slice(0, 10).map((order, idx) => (
                                    <tr key={order.id || `order-${idx}`} className="bg-background border-b hover:bg-muted/10">
                                        <td className="px-6 py-4 font-medium">{order.id || 'N/A'}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{order.email || 'Guest'}</td>
                                        <td className="px-6 py-4">{formatDate(order.date)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {order.status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">₹{(Number(order.total) || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
