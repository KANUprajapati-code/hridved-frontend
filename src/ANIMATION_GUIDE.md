# Animation Implementation Guide

This guide shows how to use all the smooth modern animations in your ecommerce site.

## 1. **Page Transitions** (Fade + Slide)

The page transitions are automatically applied to all routes using `AnimatePresence` in `App.jsx`.

**Usage:** Simply wrap page content with `AnimatedPage`:

```jsx
import AnimatedPage from '../components/AnimatedPage';

export default function ProductPage() {
  return (
    <AnimatedPage>
      <div className="container mx-auto">
        {/* Your content */}
      </div>
    </AnimatedPage>
  );
}
```

## 2. **Add to Cart Animation** (Fly Effect)

Animate items flying from product card to cart.

**Usage:**

```jsx
import { useFlyingElement } from '../hooks/useFlyingElement';

export default function ProductCard() {
  const { animateAddToCart } = useFlyingElement();
  const cartIconRef = useRef(null);
  const productRef = useRef(null);

  const handleAddToCart = async (product) => {
    // Trigger animation
    animateAddToCart(productRef.current, cartIconRef.current, 'Added to cart');
    
    // Add to cart API call
    await addToCart(product);
  };

  return (
    <div ref={productRef} className="product-card">
      {/* Product content */}
      <button onClick={() => handleAddToCart(product)}>
        Add to Cart
      </button>
    </div>
  );
}
```

## 3. **Button Hover Glow**

Animated button with glowing shadow on hover.

**Usage:**

```jsx
import AnimatedButton from '../components/AnimatedButton';

export default function MyComponent() {
  return (
    <>
      <AnimatedButton variant="primary" size="md">
        Primary Button
      </AnimatedButton>
      
      <AnimatedButton variant="secondary" size="lg">
        Secondary Button
      </AnimatedButton>
      
      <AnimatedButton variant="success">
        Success Button
      </AnimatedButton>
      
      <AnimatedButton variant="danger" disabled>
        Disabled Button
      </AnimatedButton>
    </>
  );
}
```

**Variants:** primary, secondary, success, danger  
**Sizes:** sm, md, lg

## 4. **Image Zoom on Hover**

Smooth image zoom effect on hover.

**Usage:**

```jsx
import AnimatedImage from '../components/AnimatedImage';

export default function Gallery() {
  return (
    <AnimatedImage
      src="/product-image.jpg"
      alt="Product"
      containerClassName="w-full h-64"
      zoomIntensity={1.1}
      onClick={() => handleImageClick()}
    />
  );
}
```

## 5. **Dropdown Animations**

Smooth dropdown/menu animations (already implemented in Header).

**Usage in custom dropdowns:**

```jsx
import { AnimatePresence, motion } from 'framer-motion';
import { dropdownVariants } from '../utils/animations';

export default function CustomDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button>Menu</button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/* Dropdown content */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## 6. **Loading Spinner**

Smooth rotating loading spinner.

**Usage:**

```jsx
import LoadingSpinner from '../components/LoadingSpinner';

export default function MyComponent() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {/* Small spinner (inline) */}
      <LoadingSpinner size="sm" />
      
      {/* Medium spinner */}
      <LoadingSpinner size="md" />
      
      {/* Large spinner */}
      <LoadingSpinner size="lg" />
      
      {/* Full screen spinner */}
      <LoadingSpinner fullScreen />
    </>
  );
}
```

## 7. **Sticky Header Hide/Show**

The header automatically hides when scrolling down and shows when scrolling up.  
Already implemented in `Header.jsx` - no additional setup needed!

## 8. **Checkout Step Transitions**

Smooth animations for checkout progress indicator.

**Usage:** Already integrated in `CheckoutStepIndicator.jsx`

```jsx
import CheckoutStepIndicator from '../components/CheckoutStepIndicator';

export default function CheckoutPage() {
  return (
    <>
      <CheckoutStepIndicator />
      {/* Rest of checkout content */}
    </>
  );
}
```

## 9. **Toast Notifications**

Show animated toast notifications with auto-dismiss.

**Usage:**

```jsx
import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

export default function MyComponent() {
  const { addToast } = useContext(ToastContext);

  const handleSuccess = () => {
    addToast('Order placed successfully!', 'success', 3000);
  };

  const handleError = () => {
    addToast('Something went wrong', 'error', 4000);
  };

  const handleInfo = () => {
    addToast('New items added to store', 'info', 3000);
  };

  return (
    <>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleInfo}>Show Info</button>
    </>
  );
}
```

**Toast Types:** success, error, info

## 10. **Scroll Reveal Animations**

Animate elements as they come into view while scrolling.

**Usage with single element:**

```jsx
import ScrollReveal from '../components/ScrollReveal';

export default function HomePage() {
  return (
    <>
      <ScrollReveal delay={0} className="mb-8">
        <h2 className="text-3xl font-bold">Featured Products</h2>
      </ScrollReveal>

      <ScrollReveal delay={0.1} className="mb-4">
        <p className="text-gray-600">Discover our latest collection</p>
      </ScrollReveal>
    </>
  );
}
```

**Usage with multiple items (staggered):**

```jsx
import ScrollRevealContainer from '../components/ScrollRevealContainer';

export default function ProductListing() {
  const products = [...];

  return (
    <ScrollRevealContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ScrollRevealContainer>
  );
}
```

## Animation Utilities

All animation variants are defined in `/utils/animations.js` and can be used directly:

```jsx
import { motion } from 'framer-motion';
import { pageVariants, containerVariants, itemVariants, fadeVariants } from '../utils/animations';

export default function CustomAnimation() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Content */}
    </motion.div>
  );
}
```

## Custom Hooks

### useScrollReveal()

Manually control scroll reveal animations:

```jsx
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function MyComponent() {
  const { ref, controls, initial, animate } = useScrollReveal();

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      variants={scrollRevealVariants}
    >
      {/* Content */}
    </motion.div>
  );
}
```

### useFlyingElement()

Trigger flying animations for add-to-cart:

```jsx
import { useFlyingElement } from '../hooks/useFlyingElement';

const { animateAddToCart } = useFlyingElement();
```

## Performance Optimization Tips

1. **Use `triggerOnce={true}`** in scroll animations to prevent re-animations
2. **Lazy load images** before applying zoom animations
3. **Use `will-change` CSS** for frequently animated elements
4. **Debounce scroll events** for header hide/show
5. **Use `AnimatePresence` mode="wait"** to ensure smooth page transitions

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Graceful degradation for older browsers

## Customization

All animation variants can be customized in `/utils/animations.js`:

```jsx
// Example: Slower page transition
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 1 }, // Changed from 0.5
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.5 } },
};
```

---

**Ready to use!** Start integrating these animations into your components for a premium, smooth user experience.
