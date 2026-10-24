import { motion } from 'framer-motion';
import { pageVariants } from '../utils/animations';
import { useEffect, useState } from 'react';

const AnimatedPage = ({ children, className = '' }) => {
  const [hasShownBefore, setHasShownBefore] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shown = window.sessionStorage.getItem('hridved_page_transition_shown');
      if (shown === 'true') {
        setHasShownBefore(true);
      } else {
        // Mark as shown immediately on first mount
        window.sessionStorage.setItem('hridved_page_transition_shown', 'true');
      }
    }
  }, []);

  if (hasShownBefore) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
