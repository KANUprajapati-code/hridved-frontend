import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { scrollRevealVariants } from '../utils/animations';

const ScrollReveal = ({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  threshold = 0.2,
  triggerOnce = true,
}) => {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce,
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration,
            delay,
            ease: 'easeOut',
          },
        },
      }}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
