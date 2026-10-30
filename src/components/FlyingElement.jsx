import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlyingElementContext } from '../context/FlyingElementContext';

const FlyingElement = () => {
  const context = useContext(FlyingElementContext);
  const elements = context?.elements || [];
  const removeFlyingElement = context?.removeFlyingElement;

  if (!elements || elements.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {elements.map((el) => {
          const { id, startRect, endRect, imageUrl } = el;
          if (!startRect) return null;

          // Safe coordinates
          const startX = (startRect.left || 0) + (startRect.width || 60) / 2 - 28;
          const startY = (startRect.top || 0) + (startRect.height || 60) / 2 - 28;

          const destX = endRect ? (endRect.left + (endRect.width || 40) / 2 - 14) : (window.innerWidth - 60);
          const destY = endRect ? (endRect.top + (endRect.height || 40) / 2 - 14) : 24;

          // Gentle upward arc
          const midX = (startX + destX) / 2;
          const midY = Math.min(startY, destY) - 70;

          return (
            <motion.div
              key={id}
              initial={{
                x: startX,
                y: startY,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: [startX, midX, destX],
                y: [startY, midY, destY],
                scale: [1, 1.25, 0.25],
                opacity: [1, 1, 0.9],
                rotate: [0, -12, 360],
              }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                times: [0, 0.45, 1],
              }}
              onAnimationComplete={() => {
                if (removeFlyingElement) removeFlyingElement(id);
                const cartEl = document.getElementById('cart-icon-container');
                if (cartEl) {
                  cartEl.classList.remove('animate-cart-bounce');
                  void cartEl.offsetWidth; // trigger reflow
                  cartEl.classList.add('animate-cart-bounce');
                  setTimeout(() => {
                    cartEl.classList.remove('animate-cart-bounce');
                  }, 700);
                }
              }}
              className="absolute top-0 left-0 w-14 h-14 rounded-full bg-white p-1 border-2 border-secondary shadow-[0_10px_25px_rgba(212,175,55,0.7)] flex items-center justify-center overflow-hidden pointer-events-none"
              style={{ willChange: 'transform, opacity' }}
            >
              <img
                src={imageUrl || '/logo.png'}
                alt=""
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default FlyingElement;

