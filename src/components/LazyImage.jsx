import { useEffect, useRef, useState } from 'react';

const LazyImage = ({
    src,
    alt = 'Image',
    placeholder = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22400%22/%3E%3C/svg%3E',
    className = '',
    width,
    height,
    onLoad,
}) => {
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [imageRef, setImageRef] = useState(null);
    const observerTarget = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = new Image();
                        img.src = src;
                        img.onload = () => {
                            setImageSrc(src);
                            if (onLoad) onLoad();
                        };
                        img.onerror = () => {
                            // Fallback to placeholder on error
                            setImageSrc(placeholder);
                        };
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '50px' } // Start loading 50px before visible
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [src, placeholder, onLoad]);

    return (
        <img
            ref={observerTarget}
            src={imageSrc}
            alt={alt}
            className={`transition-opacity duration-300 ${imageSrc === placeholder ? 'opacity-50' : 'opacity-100'} ${className}`}
            width={width}
            height={height}
            loading="lazy"
        />
    );
};

export default LazyImage;
