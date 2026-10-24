import { createContext, useState, useCallback } from 'react';

export const FlyingElementContext = createContext();

export const FlyingElementProvider = ({ children }) => {
  const [elements, setElements] = useState([]);

  const addFlyingElement = useCallback((startRect, endRect, imageUrl) => {
    const id = Date.now() + Math.random();
    setElements((prev) => [...prev, { id, startRect, endRect, imageUrl }]);

    setTimeout(() => {
      setElements((prev) => prev.filter((el) => el.id !== id));
    }, 1000); // Increased duration slightly for the fling effect

    return id;
  }, []);

  const removeFlyingElement = useCallback((id) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
  }, []);

  return (
    <FlyingElementContext.Provider value={{ elements, addFlyingElement, removeFlyingElement }}>
      {children}
    </FlyingElementContext.Provider>
  );
};
