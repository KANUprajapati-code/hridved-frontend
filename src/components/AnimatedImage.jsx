import { motion } from 'framer-motion';
import { imageHoverVariants } from '../utils/animations';

const AnimatedImage = ({
  src,
  alt = 'Image',
  className = '',
  containerClassName = '',
  zoomIntensity = 1.08,
  loading = 'lazy',
  onClick,
  ...props
}) => {
  return (
    <motion.div
      className={`overflow-hidden rounded-lg ${containerClassName}`}
      whileHover={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      <motion.img
        src={src}
        alt={alt}
        loading={loading}
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
