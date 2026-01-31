"use client";

import { useForm } from "react-hook-form";
import { Banner, useBannerStore } from "@/lib/banner-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { ImageCropperModal } from "./ImageCropperModal";

interface BannerFormProps {
    initialData?: Banner | null;
    onClose: () => void;
}

type FormData = {
    image: string;
    link: string;
    isActive: boolean;
};

export function BannerForm({ initialData, onClose }: BannerFormProps) {
    const { addBanner, updateBanner } = useBannerStore();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cropper State
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            image: "",
            link: "",
            isActive: true,
        },
    });

    const currentImage = watch("image");

    useEffect(() => {
        if (initialData) {
            reset({
                image: initialData.image,
                link: initialData.link,
                isActive: initialData.isActive,
            });
            setPreviewUrl(initialData.image);
        } else {
            reset({
                image: "",
                link: "",
                isActive: true
            });
            setPreviewUrl(null);
        }
    }, [initialData, reset]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simple validation
        if (file.size > 20 * 1024 * 1024) {
            alert("File is too large. Please choose an image under 20MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setTempImage(base64String);
            setShowCropper(true);

            // Reset file input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsDataURL(file);
    };

    const handleCroppedImage = (croppedBase64: string) => {
        setPreviewUrl(croppedBase64);
        setValue("image", croppedBase64);
        setShowCropper(false);
        setTempImage(null);
    };

    const handleRemoveImage = () => {
        setPreviewUrl(null);
        setValue("image", "");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const onSubmit = (data: FormData) => {
        if (!data.image) {
            alert("Please select an image.");
            return;
        }

        if (initialData) {
            updateBanner(initialData.id, data);
        } else {
            addBanner(data);
        }
        onClose();
    };

    return (
        <>
            {showCropper && tempImage && (
                <ImageCropperModal
                    imageSrc={tempImage}
                    onClose={() => setShowCropper(false)}
                    onSave={handleCroppedImage}
                    aspect={21 / 9} // Banner aspect ratio
                />
            )}

            <div className="bg-white border border-stone-100 rounded-xl p-8 shadow-xl max-w-2xl mx-auto relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-200 to-stone-200" />

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl font-serif font-medium text-stone-900 mb-2">
                        {initialData ? "Edit Banner" : "Add New Banner"}
                    </h2>
                    <p className="text-stone-500 text-sm">
                        Upload an image and set details for your homepage hero carousel.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-700">Banner Image</label>

                        {/* Hidden input for Form Data */}
                        <input type="hidden" {...register("image", { required: "Image is required" })} />

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {previewUrl ? (
                            <div className="relative w-full aspect-[21/9] rounded-lg overflow-hidden border border-stone-200 group">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        type="button"
                                        onClick={triggerFileInput}
                                        variant="secondary"
                                        className="bg-white/90 hover:bg-white text-stone-900"
                                    >
                                        Change
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        variant="destructive"
                                        size="icon"
                                        className="bg-red-500 hover:bg-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={triggerFileInput}
                                className="w-full aspect-[21/9] rounded-lg border-2 border-dashed border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-stone-600"
                            >
                                <div className="p-4 rounded-full bg-stone-100">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-stone-700">Click to upload image</p>
                                    <p className="text-xs text-stone-400">SVG, PNG, JPG or GIF (max. 20MB)</p>
                                </div>
                            </div>
                        )}
                        {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-700">Redirect Link</label>
                        <Input
                            {...register("link")}
                            placeholder="Enter redirect link"
                            className="border-stone-200 focus-visible:ring-stone-400 focus-visible:border-stone-400 bg-stone-50/50"
                        />
                    </div>

                    <div className="bg-stone-50 p-4 rounded-lg flex items-center justify-between border border-stone-100">
                        <div className="space-y-0.5">
                            <label htmlFor="isActive" className="text-sm font-medium text-stone-900 block cursor-pointer">
                                Active Status
                            </label>
                            <p className="text-xs text-stone-500">Visible on the homepage carousel</p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="isActive"
                                {...register("isActive")}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-stone-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
                        <Button type="button" variant="ghost" onClick={onClose} className="text-stone-500 hover:text-stone-900 hover:bg-stone-100">
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-[#C5A265] hover:bg-[#B08D55] text-white shadow-md">
                            {initialData ? "Save Changes" : "Create Banner"}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
