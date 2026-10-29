import LazyImage from './LazyImage';
import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

import { getImageUrl } from '../utils/api';

const ProductImage = ({
    src,
    alt = 'Product Image',
    className = '',
    width,
    height,
    onLoad,
    showPlaceholder = true,
    objectFit = 'cover',
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const imageSource = getImageUrl(src) || src;

    const placeholderSvg = `data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22400%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22system-ui%22 font-size=%2250%22 fill=%22%23d1d5db%22%3E%3C/text%3E%3C/svg%3E`;

    return (
        <div className={`relative bg-transparent overflow-hidden ${className}`}>
            {isLoading && showPlaceholder && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 animate-pulse flex items-center justify-center">
                    <ImageIcon size={48} className="text-gray-300" />
                </div>
            )}

            <LazyImage
                src={imageSource}
                alt={alt}
                placeholder={placeholderSvg}
                className={`w-full h-full ${objectFit === 'contain' ? 'object-contain p-1' : 'object-cover'} transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                width={width}
                height={height}
                onLoad={() => {
                    setIsLoading(false);
                    if (onLoad) onLoad();
                }}
            />

            {hasError && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                        <ImageIcon size={48} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">Image unavailable</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductImage;
