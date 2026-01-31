
"use client";
import { useStore, useProductStore } from "@/lib/store";

export default function AdminDashboard() {
    // Atomic selectors to prevent re-renders on every store update
    const orders = useStore(state => state.orders || []);
    const storeProducts = useProductStore(state => state.products || []);

    // Safe date formatter
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return "Invalid Date";
            }
            return date.toLocaleDateString();
        } catch (e) {
            return "Date Error";
        }
    };

    // Calculate dynamic stats safely
    const safeOrders = Array.isArray(orders) ? orders : [];
    const safeProducts = Array.isArray(storeProducts) ? storeProducts : [];

    const totalSales = safeOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    const activeOrders = safeOrders.filter(o => o.status === 'Pending' || o.status === 'In Transit' || o.status === 'Shipped').length;
    const productsInStock = safeProducts.filter(p => p.inStock).length;

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-serif font-bold">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Sales", value: `₹${totalSales.toLocaleString()}`, change: safeOrders.length > 0 ? "Real Data" : "No Sales" },
                    { label: "Active Orders", value: activeOrders.toString(), change: "" },
                    { label: "Products in Stock", value: productsInStock.toString(), change: safeProducts.length > 0 ? "Live" : "Loading..." },
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
                <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
                {safeOrders.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                        No orders yet. Go to the store and place an order!
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
