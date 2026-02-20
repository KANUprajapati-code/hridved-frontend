import { useContext } from 'react';
import { FlyingElementContext } from '../context/FlyingElementContext';

export const useFlyingElement = () => {
  const context = useContext(FlyingElementContext);

  if (!context) {
    throw new Error('useFlyingElement must be used within FlyingElementProvider');
  }

  const { addFlyingElement } = context;

  const animateAddToCart = (fromElement, toElement, content = 'Added to cart') => {
    if (!fromElement || !toElement) return;

    const startRect = fromElement.getBoundingClientRect();
    const endRect = toElement.getBoundingClientRect();

    addFlyingElement(startRect, endRect, content);
  };

  return {
    animateAddToCart,
    addFlyingElement,
  };
};
