import { motion } from 'framer-motion';
import { useContext } from 'react';
import { FlyingElementContext } from '../context/FlyingElementContext';

const FlyingElement = () => {
  const { elements } = useContext(FlyingElementContext);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          initial={{
            x: element.startRect.left,
            y: element.startRect.top,
            opacity: 1,
            scale: 1,
            rotate: 0,
          }}
          animate={{
            x: [
              element.startRect.left,
              element.startRect.left + (element.endRect.left - element.startRect.left) * 0.4, // Arc peak X
              element.endRect.left + element.endRect.width / 2 - 20 // Final X
            ],
            y: [
              element.startRect.top,
              element.startRect.top - 150, // Arc peak Y (fling up)
              element.endRect.top + element.endRect.height / 2 - 20 // Final Y
            ],
            opacity: [1, 1, 0],
            scale: [1, 0.8, 0.2],
            rotate: [0, 45, 180],
          }}
          transition={{
            duration: 1,
            ease: 'easeInOut',
            times: [0, 0.4, 1]
          }}
          className="absolute w-12 h-12 flex items-center justify-center overflow-hidden rounded-lg shadow-2xl border-2 border-white pointer-events-none"
          style={{ zIndex: 9999 }}
        >
          {element.imageUrl ? (
            <img
              src={element.imageUrl}
              alt="flying product"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="bg-primary p-3 text-white text-2xl">🛍️</div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default FlyingElement;
