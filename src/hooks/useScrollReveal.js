import { useInView } from 'react-intersection-observer';
import { useAnimation, useMotionValue } from 'framer-motion';
import { useEffect } from 'react';

export const useScrollReveal = (threshold = 0.2) => {
  const controls = useAnimation();
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return {
    ref,
    controls,
    initial: 'hidden',
    animate: controls,
  };
};

export const useScrollRevealBatch = (threshold = 0.2) => {
  const controls = useAnimation();
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return {
    ref,
    controls,
  };
};
