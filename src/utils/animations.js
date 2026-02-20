// Animation variants for Framer Motion
// Premium smooth animations inspired by Apple and Amazon

// Page Transitions
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

// Stagger container for animating child items
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Individual item animation for staggered lists
export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// Scroll reveal animation
export const scrollRevealVariants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

// Image zoom on hover
export const imageHoverVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.08,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Button glow effect
export const buttonGlowVariants = {
  initial: {
    boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)',
  },
  hover: {
    boxShadow: '0 0 20px 0 rgba(59, 130, 246, 0.5)',
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Cart fly animation (flying object to cart)
export const cartFlyVariants = {
  initial: {
    opacity: 1,
    scale: 1,
    y: 0,
    x: 0,
  },
  animate: (custom) => ({
    opacity: 0,
    scale: 0.2,
    y: custom.targetY,
    x: custom.targetX,
    transition: {
      duration: 0.8,
      ease: 'easeInQuad',
    },
  }),
};

// Loading spinner
export const spinnerVariants = {
  rotate: {
    rotate: 360,
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Dropdown animation
export const dropdownVariants = {
  closed: {
    opacity: 0,
    y: -8,
    pointerEvents: 'none',
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
  open: {
    opacity: 1,
    y: 0,
    pointerEvents: 'auto',
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Header hide/show on scroll
export const headerVariants = {
  visible: {
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  hidden: {
    y: -100,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

// Checkout step transition
export const stepVariants = {
  initial: {
    opacity: 0,
    x: 100,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

// Toast notification animation
export const toastVariants = {
  initial: {
    opacity: 0,
    y: 20,
    x: 0,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

// Smooth scroll configuration
export const smoothScrollOptions = {
  behavior: 'smooth',
  block: 'start',
  inline: 'nearest',
};

// Tap animation for buttons and clickable elements
export const tapVariants = {
  tap: { scale: 0.95 },
};

// Fade animation
export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};
