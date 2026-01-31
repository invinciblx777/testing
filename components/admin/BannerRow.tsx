"use client";

import { Banner, useBannerStore } from "@/lib/banner-store";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface BannerRowProps {
    banner: Banner;
    index: number;
    total: number;
    onEdit: (banner: Banner) => void;
}

export function BannerRow({ banner, index, total, onEdit }: BannerRowProps) {
    const { deleteBanner, reorderBanners, toggleBannerStatus } = useBannerStore();

    const handleMoveUp = () => {
        if (index > 0) reorderBanners(index, index - 1);
    };

    const handleMoveDown = () => {
        if (index < total - 1) reorderBanners(index, index + 1);
    };

    return (
        <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center py-4 border-b border-stone-100 last:border-0 hover:bg-stone-50/50 transition-colors bg-white rounded-lg md:rounded-none border border-stone-200 md:border-x-0 md:border-t-0 p-4 md:p-0 md:py-4 shadow-sm md:shadow-none mb-4 md:mb-0">

            {/* Banner Image & Info */}
            <div className="col-span-4 flex items-center gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-24 h-40 md:h-14 rounded-md overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    {banner.image ? (
                        <img
                            src={banner.image}
                            alt={`Banner ${banner.id}`}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">
                            No Img
                        </div>
                    )}
                </div>
            </div>

            {/* Redirect Link */}
            <div className="col-span-4 w-full md:w-auto">
                <span className="md:hidden text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1 block">Link</span>
                <p className="text-sm font-medium text-stone-700 truncate">
                    {banner.link || "No link set"}
                </p>
            </div>

            {/* Status */}
            <div className="col-span-2 w-full md:w-auto flex items-center justify-between md:block">
                <span className="md:hidden text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</span>
                <span
                    className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium tracking-wide border",
                        banner.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-stone-100 text-stone-500 border-stone-200"
                    )}
                >
                    {banner.isActive ? "Active" : "Inactive"}
                </span>
            </div>

            {/* Actions */}
            <div className="col-span-2 flex items-center justify-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                {/* Order */}
                <div className="flex bg-stone-100 rounded-md border border-stone-200 mr-2 md:mr-2 md:bg-transparent md:border-0">
                    <button
                        className="p-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-30 border-r border-stone-200 md:border-0"
                        disabled={index === 0}
                        onClick={handleMoveUp}
                        title="Move Up"
                    >
                        <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                        className="p-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-30"
                        disabled={index === total - 1}
                        onClick={handleMoveDown}
                        title="Move Down"
                    >
                        <ArrowDown className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => toggleBannerStatus(banner.id)}
                        className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
                        title={banner.isActive ? "Deactivate" : "Activate"}
                    >
                        {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                        onClick={() => onEdit(banner)}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to delete this banner?")) {
                                deleteBanner(banner.id);
                            }
                        }}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
