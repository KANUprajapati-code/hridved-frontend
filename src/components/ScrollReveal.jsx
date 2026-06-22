import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

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

  const [hasShownBefore, setHasShownBefore] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shown = window.sessionStorage.getItem('hridved_scroll_reveal_shown');
      if (shown === 'true') {
        setHasShownBefore(true);
      } else {
        // Mark as shown after 3 seconds so the very first view of the site can animate nicely
        const timer = setTimeout(() => {
          window.sessionStorage.setItem('hridved_scroll_reveal_shown', 'true');
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  if (hasShownBefore) {
    return <div className={className}>{children}</div>;
  }

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
