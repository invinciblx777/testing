"use client";

import { useShippingStore } from "@/lib/shippingStore";
import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Eye, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";

export default function AdminOrdersPage() {
    const { orders } = useShippingStore();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-bold">Orders</h1>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                </div>
            </div>

            <div className="bg-background rounded-lg border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[800px] md:min-w-full">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3 hidden md:table-cell">Date</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3 hidden md:table-cell">Shipment</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredOrders.map(order => (
                                <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground">
                                        {order.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{order.customer.name}</div>
                                        <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">{order.date}</td>
                                    <td className="px-6 py-4">
                                        <OrderStatusBadge status={order.orderStatus} />
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        {formatPrice(order.totalAmount)}
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        {order.shipment.trackingStatus ||
                                            <span className="text-muted-foreground text-xs italic">Not started</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/orders/${order.id}`}>
                                            <Button variant="ghost" size="sm">
                                                <Eye className="w-4 h-4 mr-2" />
                                                View
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
