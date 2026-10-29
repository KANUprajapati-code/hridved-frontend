const AnimatedPage = ({ children, className = '' }) => {
  return (
    <div className={`transition-opacity duration-300 ease-in-out ${className}`}>
      {children}
    </div>
  );
};

export default AnimatedPage;
