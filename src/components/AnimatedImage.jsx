const AnimatedImage = ({
  src,
  alt = 'Image',
  className = '',
  containerClassName = '',
  loading = 'lazy',
  fetchPriority,
  onClick,
  ...props
}) => {
  return (
    <div
      className={`overflow-hidden rounded-xl bg-gray-100 transition-all duration-300 ${containerClassName}`}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        fetchpriority={fetchPriority}
        decoding="async"
        className={`w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-105 ${className}`}
        {...props}
      />
    </div>
  );
};

export default AnimatedImage;
