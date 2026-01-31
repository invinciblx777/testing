"use client";

import { useState, useEffect } from "react";
import { Product } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash, EyeOff } from "lucide-react";
import { useProductStore } from "@/lib/store";
import ProductForm from "@/components/admin/ProductForm";

export default function AdminProducts() {
    // 1. Get state and actions from the store
    const { products, addProduct, deleteProduct, toggleStock: toggleStockStore, updateProduct } = useProductStore();
    const [hydrated, setHydrated] = useState(false);

    // 2. Handle hydration
    useEffect(() => {
        useProductStore.persist.rehydrate();
        setHydrated(true);
    }, []);

    const [isAdding, setIsAdding] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formKey, setFormKey] = useState(0);

    const handleSave = (data: Product) => {
        if (editingProduct) {
            updateProduct(data);
            setEditingProduct(null);
            setIsAdding(true); // Switch back to Add mode
        } else {
            addProduct(data);
            // Keep adding mode open
        }
        // Force form reset by changing key
        setFormKey(prev => prev + 1);
        // Optional: Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsAdding(false);
        // Scroll to top to see form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingProduct(null);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            deleteProduct(id);
        }
    }

    const toggleStock = (id: string) => {
        toggleStockStore(id);
    }

    if (!hydrated) {
        return <div className="p-8">Loading products...</div>;
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-bold">Products</h1>
                {!isAdding && !editingProduct && (
                    <Button onClick={() => setIsAdding(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Product
                    </Button>
                )}
            </div>

            {/* PRODUCT FORM (ADD / EDIT) */}
            {(isAdding || editingProduct) && (
                <ProductForm
                    key={editingProduct ? editingProduct.id : `new-${formKey}`}
                    initialData={editingProduct || undefined}
                    onSubmit={handleSave}
                    onCancel={handleCancel}
                />
            )}

            <div className="bg-background rounded-lg border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[600px] md:min-w-full">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3 hidden md:table-cell">Category</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3 hidden md:table-cell">Stock</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {products.map(product => {
                                const isLowStock = product.stockRemaining <= 5 && product.inStock;
                                return (
                                    <tr key={product.id} className="hover:bg-muted/10">
                                        <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                                            {/* Preview Image in Table */}
                                            <div className="w-10 h-10 rounded bg-muted overflow-hidden relative border border-border shrink-0">
                                                {/* Display image if available, else placeholder */}
                                                {product.images[0] ? (
                                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-stone-200" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span>{product.name}</span>
                                                {product.stockRemaining !== undefined && (
                                                    <span className="text-xs text-muted-foreground md:hidden">Qty: {product.stockRemaining}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 capitalize hidden md:table-cell">{product.category}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                {product.discountPrice && product.discountPrice < product.price ? (
                                                    <>
                                                        <span className="font-medium">{formatPrice(product.discountPrice)}</span>
                                                        <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
                                                    </>
                                                ) : (
                                                    formatPrice(product.price)
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="flex gap-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                                </span>
                                                {isLowStock && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 animate-pulse">
                                                        Low Stock
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                            <Button variant="ghost" size="icon" onClick={() => toggleStock(product.id)} title="Toggle Stock">
                                                <EyeOff className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(product.id)}>
                                                <Trash className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
