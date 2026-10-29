import React from 'react';

/**
 * Standardized Skeleton Shimmer Components
 * Prevents Cumulative Layout Shift (CLS) during data fetching
 */

export const Skeleton = ({
  className = '',
  rounded = 'rounded-lg',
  ...props
}) => {
  return (
    <div
      className={`
        bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200
        bg-[length:200%_100%] animate-pulse
        ${rounded}
        ${className}
      `}
      {...props}
    />
  );
};

export const ProductCardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col h-full"
        >
          {/* Image skeleton */}
          <Skeleton className="w-full aspect-square rounded-xl mb-4" />
          
          {/* Category badge skeleton */}
          <Skeleton className="w-20 h-4 rounded-full mb-2" />
          
          {/* Title skeleton */}
          <Skeleton className="w-3/4 h-5 mb-1" />
          <Skeleton className="w-1/2 h-5 mb-3" />
          
          {/* Rating skeleton */}
          <div className="flex gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, starIdx) => (
              <Skeleton key={starIdx} className="w-3.5 h-3.5 rounded-full" />
            ))}
          </div>
          
          {/* Price & CTA skeleton */}
          <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
            <Skeleton className="w-16 h-6" />
            <Skeleton className="w-24 h-9 rounded-xl" />
          </div>
        </div>
      ))}
    </>
  );
};

export const CategoryChipSkeleton = ({ count = 5 }) => {
  return (
    <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton
          key={idx}
          className="h-9 w-28 shrink-0 rounded-full"
        />
      ))}
    </div>
  );
};

export const BannerSkeleton = ({ className = 'h-64 sm:h-96' }) => {
  return (
    <div className={`w-full ${className} rounded-3xl overflow-hidden`}>
      <Skeleton className="w-full h-full rounded-3xl" />
    </div>
  );
};

export default Skeleton;
