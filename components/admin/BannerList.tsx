"use client";

import { useBannerStore, Banner } from "@/lib/banner-store";
import { BannerRow } from "./BannerRow";
import { BannerForm } from "./BannerForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function BannerList() {
    const banners = useBannerStore((state) => state.banners);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Close form handler
    const closeForm = () => {
        setEditingBanner(null);
        setIsCreating(false);
    };

    const isFormOpen = isCreating || !!editingBanner;

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-6 md:p-0">
            <div className="flex items-center justify-end">
                {!isFormOpen && (
                    <Button
                        onClick={() => setIsCreating(true)}
                        className="bg-[#C5A265] hover:bg-[#B08D55] text-white rounded-md px-6 py-2 h-10 shadow-sm transition-colors text-sm font-medium w-full md:w-auto"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Banner
                    </Button>
                )}
            </div>

            {isFormOpen ? (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                    <BannerForm
                        initialData={editingBanner}
                        onClose={closeForm}
                    />
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
                    <div className="w-full">
                        {/* Table Header - Hidden on Mobile */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                            <div className="col-span-4">Banner Image</div>
                            <div className="col-span-4">Redirect Link</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        {/* Table Body */}
                        <div className="px-4 py-4 md:px-6 md:py-0">
                            {banners.length === 0 ? (
                                <div className="text-center py-24">
                                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Plus className="w-8 h-8 text-stone-300" />
                                    </div>
                                    <h3 className="text-lg font-medium text-stone-900 mb-1">No banners yet</h3>
                                    <p className="text-stone-500 max-w-sm mx-auto">
                                        Add your first hero banner.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4 md:space-y-0">
                                    {banners.map((banner, index) => (
                                        <BannerRow
                                            key={banner.id}
                                            banner={banner}
                                            index={index}
                                            total={banners.length}
                                            onEdit={setEditingBanner}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
