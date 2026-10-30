import { useContext } from 'react';
import { FlyingElementContext } from '../context/FlyingElementContext';

export const useFlyingElement = () => {
  const context = useContext(FlyingElementContext);

  if (!context) {
    throw new Error('useFlyingElement must be used within FlyingElementProvider');
  }

  const { addFlyingElement } = context;

  const animateAddToCart = (fromElement, toElement, image) => {
    if (!fromElement) return;

    const targetEl = toElement || document.getElementById('cart-icon-container');
    const startRect = fromElement.getBoundingClientRect();
    const endRect = targetEl ? targetEl.getBoundingClientRect() : {
      left: typeof window !== 'undefined' ? window.innerWidth - 60 : 300,
      top: 24,
      width: 40,
      height: 40
    };

    addFlyingElement(startRect, endRect, image);
  };

  return {
    animateAddToCart,
    addFlyingElement,
  };
};
