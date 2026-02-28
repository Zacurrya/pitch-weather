import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Full-screen photo gallery lightbox.
 * Displays one photo at a time with prev/next navigation and a dot indicator.
 *
 * @param {{ photos: string[], alt?: string, onClose: () => void }} props
 */
const PhotoGallery = ({ photos = [], alt = 'Photo', onClose }) => {
    const [index, setIndex] = useState(0);

    if (photos.length === 0) return null;

    const prev = () => setIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
    const next = () => setIndex((i) => (i === photos.length - 1 ? 0 : i + 1));

    return (
        <div
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 text-white/80 hover:text-white active:opacity-70 z-10"
            >
                <X className="w-8 h-8" strokeWidth={2.5} />
            </button>

            {/* Image + arrows */}
            <div
                className="relative flex items-center justify-center w-full flex-1 px-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Prev arrow */}
                {photos.length > 1 && (
                    <button
                        onClick={prev}
                        className="absolute left-3 p-2 text-white/70 hover:text-white active:scale-90 transition-all z-10"
                    >
                        <ChevronLeft className="w-9 h-9" strokeWidth={2.5} />
                    </button>
                )}

                {/* Photo */}
                <img
                    src={photos[index]}
                    alt={`${alt} ${index + 1}`}
                    className="max-w-[92%] max-h-[80dvh] object-contain rounded-2xl select-none"
                    draggable={false}
                />

                {/* Next arrow */}
                {photos.length > 1 && (
                    <button
                        onClick={next}
                        className="absolute right-3 p-2 text-white/70 hover:text-white active:scale-90 transition-all z-10"
                    >
                        <ChevronRight className="w-9 h-9" strokeWidth={2.5} />
                    </button>
                )}
            </div>

            {/* Dot indicators */}
            {photos.length > 1 && (
                <div className="flex gap-2 py-4" onClick={(e) => e.stopPropagation()}>
                    {photos.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${i === index ? 'bg-white scale-110' : 'bg-white/40'
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* Counter */}
            <p className="text-white/60 text-sm font-medium pb-4">
                {index + 1} / {photos.length}
            </p>
        </div>
    );
};

export default PhotoGallery;
