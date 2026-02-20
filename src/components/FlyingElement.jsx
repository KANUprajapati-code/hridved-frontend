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
          }}
          animate={{
            x: element.endRect.left + element.endRect.width / 2,
            y: element.endRect.top + element.endRect.height / 2,
            opacity: 0,
            scale: 0.2,
          }}
          transition={{
            duration: 0.8,
            ease: 'easeInQuad',
          }}
          className="absolute w-12 h-12 flex items-center justify-center"
        >
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 shadow-lg text-white text-2xl">
            🛍️
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FlyingElement;
