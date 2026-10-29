const ScrollRevealContainer = ({
  children,
  className = '',
}) => {
  return (
    <div className={`transition-all duration-300 ease-out ${className}`}>
      {children}
    </div>
  );
};

export default ScrollRevealContainer;
