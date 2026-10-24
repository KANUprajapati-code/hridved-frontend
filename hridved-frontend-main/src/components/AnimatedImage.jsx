import { motion } from 'framer-motion';
import { imageHoverVariants } from '../utils/animations';

const AnimatedImage = ({
  src,
  alt = 'Image',
  className = '',
  containerClassName = '',
  zoomIntensity = 1.08,
  loading = 'lazy',
  fetchPriority,
  onClick,
  ...props
}) => {
  return (
    <motion.div
      className={`overflow-hidden rounded-lg bg-gray-100 ${containerClassName}`}
      whileHover={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      <motion.img
        src={src}
        alt={alt}
        loading={loading}
        fetchpriority={fetchPriority}
        decoding="async"
        className={`w-full h-full object-cover ${className}`}
        initial={{ scale: 1 }}
        whileHover={{ scale: zoomIntensity }}
        transition={{
          duration: 0.4,
          ease: 'easeOut',
        }}
        {...props}
      />
    </motion.div>
  );
};

export default AnimatedImage;
