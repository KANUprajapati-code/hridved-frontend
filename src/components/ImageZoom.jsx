import { useState } from 'react';
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductImage from './ProductImage';

const ImageZoom = ({ images = [] }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

    const selectedImage = images[selectedImageIndex];

    const handleMouseMove = (e) => {
        if (!isZoomed) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x, y });
    };

    const nextImage = () => {
        setSelectedImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image with Zoom */}
            <div
                className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-zoom-in group border border-gray-200"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
            >
                <ProductImage
                    src={selectedImage}
                    alt="Product"
                    className={`w-full h-full transition-transform duration-200 ${
                        isZoomed ? 'scale-200 cursor-zoom-out' : 'scale-100'
                    }`}
                    width={600}
                    height={600}
                />

                {/* Zoom Hint */}
                {!isZoomed && (
                    <div className="absolute top-3 right-3 bg-white rounded-lg p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn size={20} className="text-gray-700" />
                    </div>
                )}

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {selectedImageIndex + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                selectedImageIndex === idx
                                    ? 'border-primary ring-2 ring-primary ring-offset-1'
                                    : 'border-gray-300 hover:border-primary'
                            }`}
                        >
                            <ProductImage
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full"
                                width={150}
                                height={150}
                                showPlaceholder={false}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageZoom;
