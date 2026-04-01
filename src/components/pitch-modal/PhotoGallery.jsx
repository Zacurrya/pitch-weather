import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import './PhotoGallery.css';

/**
Full-screen photo gallery lightbox.
Displays one photo at a time with prev/next navigation and a dot indicator.

@param props { photos, alt, title, onClose }
*/
export default function PhotoGallery({ photos = [], alt = 'Photo', title, onClose }) {
    const [index, setIndex] = useState(0);

    if (photos.length === 0) return null;

    const prev = () => setIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
    const next = () => setIndex((i) => (i === photos.length - 1 ? 0 : i + 1));

    return (
        <div
            className="gallery"
            onClick={onClose}
        >
            {title && (
                <h2 className="gallery__title">
                    {title}
                </h2>
            )}

            <button
                onClick={onClose}
                className="gallery__close"
            >
                <X className="gallery__close-icon" strokeWidth={2.5} />
            </button>

            {/* Image + arrows */}
            <div
                className="gallery__viewport"
                onClick={(e) => e.stopPropagation()}
            >
                {photos.length > 1 && (
                    <button
                        onClick={prev}
                        className="gallery__arrow gallery__arrow--prev"
                    >
                        <ChevronLeft className="gallery__arrow-icon" strokeWidth={2.5} />
                    </button>
                )}

                {/* Photos (all rendered for caching, inactive are hidden) */}
                {photos.map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        alt={`${alt} ${i + 1}`}
                        className={`gallery__image ${i === index ? 'gallery__image--active' : ''}`}
                        draggable={false}
                    />
                ))}

                {photos.length > 1 && (
                    <button
                        onClick={next}
                        className="gallery__arrow gallery__arrow--next"
                    >
                        <ChevronRight className="gallery__arrow-icon" strokeWidth={2.5} />
                    </button>
                )}
            </div>

            {/* Dot indicators */}
            {photos.length > 1 && (
                <div className="gallery__dots" onClick={(e) => e.stopPropagation()}>
                    {photos.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`gallery__dot ${i === index ? 'gallery__dot--active' : ''}`}
                        />
                    ))}
                </div>
            )}

            <p className="gallery__counter">
                {index + 1} / {photos.length}
            </p>
        </div>
    );
};
