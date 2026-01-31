"use client";

import { useState } from "react";
import { useReviewsStore } from "@/lib/reviews-store";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, GripVertical, Star } from "lucide-react";
import { FaStar } from "react-icons/fa";
import { ImageCropperModal } from "@/components/admin/ImageCropperModal";

export default function ReviewsAdminPage() {
    const { reviews, addReview, deleteReview } = useReviewsStore();
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [rating, setRating] = useState(5);
    const [image, setImage] = useState("");

    // Image Cropper State
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();

        if (!image) {
            alert("Please select a reviewer image");
            return;
        }

        addReview({
            name,
            description,
            rating,
            image: image || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", // Default avatar if needed, though input is required? User said "Required field" for image.
        });

        // Reset form
        setName("");
        setDescription("");
        setRating(5);
        setImage("");
        setIsAdding(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result as string);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
        // Reset input value so same file can be selected again if needed
        e.target.value = "";
    };

    const handleCropSave = (croppedImage: string) => {
        setImage(croppedImage);
        setShowCropper(false);
        setTempImage(null);
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
            {showCropper && tempImage && (
                <ImageCropperModal
                    imageSrc={tempImage}
                    onClose={() => {
                        setShowCropper(false);
                        setTempImage(null);
                    }}
                    onSave={handleCropSave}
                />
            )}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Manage Reviews</h1>
                    <p className="text-muted-foreground mt-1">Add or remove customer testimonials. All reviews are marked as Verified Buyer.</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    {isAdding ? "Cancel" : "Add Review"}
                </Button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-lg border shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-lg font-semibold mb-4">New Testimonial</h2>
                    <form onSubmit={handleAdd} className="space-y-6">

                        {/* 1. Reviewer Image */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reviewer Image <span className="text-red-500">*</span></label>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    {image && (
                                        <div className="relative w-20 h-20 rounded-full overflow-hidden border border-border shrink-0">
                                            <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-gray-600 file:border-0 file:bg-primary file:text-white file:text-sm file:font-medium file:rounded-md file:mr-4 hover:file:bg-primary/90 cursor-pointer"
                                            onChange={handleFileChange}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">Upload a clear photo. A crop tool will appear.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Customer Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Customer Name <span className="text-red-500">*</span></label>
                            <input
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Enter customer name"
                            />
                        </div>

                        {/* 3. Description (Internal) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(Internal reference only)</span></label>
                            <textarea
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Enter internal note"
                            />
                        </div>

                        {/* 4. Rating */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rating <span className="text-red-500">*</span></label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <FaStar
                                            size={28}
                                            className={star <= rating ? "text-[#801848]" : "text-gray-300"}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <Button type="submit">Save Review</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="flex items-center gap-4 bg-white p-4 rounded-lg border group hover:border-primary/50 transition-colors">
                        <GripVertical className="text-muted-foreground cursor-grab opacity-50" />

                        {review.image ? (
                            <img src={review.image} alt={review.name} className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-stone-400 font-bold text-xs uppercase">
                                {review.name.charAt(0)}
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium truncate">{review.name}</h3>
                                <div className="flex text-[#801848] text-xs">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <FaStar key={i} size={10} />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium border border-green-200">Verified Buyer</span>
                            </div>
                            {review.description && (
                                <p className="text-sm text-gray-500 line-clamp-1 mt-1 italic">Note: {review.description}</p>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteReview(review.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}

                {reviews.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
                        No reviews yet. Add one to get started!
                    </div>
                )}
            </div>
        </div>
    );
}
