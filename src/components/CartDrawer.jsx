import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Drawer from './Drawer';
import Badge from './Badge';
import { trackWebsiteEvent } from '../utils/websiteAnalytics';

const CartDrawer = () => {
  const { cart, isCartDrawerOpen, closeCartDrawer, updateCartItemQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const cartItems = cart?.cartItems || [];
  const itemsCount = cartItems.reduce((acc, item) => acc + (Number(item.qty) || 1), 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.qty) || 1) * (Number(item.price) || 0), 0);
  const freeShippingThreshold = 999;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  useEffect(() => {
    if (isCartDrawerOpen && cartItems.length > 0) {
      trackWebsiteEvent('view_cart', { cartTotal: subtotal });
    }
  }, [isCartDrawerOpen]);

  const handleProceedToCheckout = () => {
    closeCartDrawer();
    navigate('/checkout/address');
  };

  const handleViewCart = () => {
    closeCartDrawer();
    navigate('/cart');
  };

  const handleExploreShop = () => {
    closeCartDrawer();
    navigate('/shop');
  };

  return (
    <Drawer
      isOpen={isCartDrawerOpen}
      onClose={closeCartDrawer}
      position="right"
      width="md"
      title="Herbal Basket"
      subtitle={itemsCount > 0 ? `${itemsCount} formulation${itemsCount > 1 ? 's' : ''} selected` : 'Your basket is empty'}
      footer={
        itemsCount > 0 ? (
          <div className="p-4 sm:p-5 bg-[#FDFBF7] border-t border-accent/40 space-y-3 font-body">
            {/* Calculation Summary */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Estimate</span>
                <span className={`font-bold ${isFreeShipping ? 'text-emerald-700' : 'text-gray-900'}`}>
                  {isFreeShipping ? 'FREE' : '₹50'}
                </span>
              </div>
              <div className="border-t border-accent/30 pt-2 flex justify-between items-baseline">
                <span className="text-sm font-bold text-primary">Estimated Total</span>
                <div className="text-right">
                  <span className="text-xl font-sans font-black text-primary">
                    ₹{(subtotal + (isFreeShipping ? 0 : 50)).toLocaleString()}
                  </span>
                  <p className="text-[10px] text-gray-500">Taxes & GST included</p>
                </div>
              </div>
            </div>

            {/* Actions Stack */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full h-11 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={handleViewCart}
                className="w-full h-10 bg-white text-primary border border-primary/30 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary/5 transition flex items-center justify-center cursor-pointer"
              >
                View Full Basket & Coupons
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-gray-500">
              <ShieldCheck size={14} className="text-secondary shrink-0" />
              <span>Authentic Ayurvedic Quality Guaranteed</span>
            </div>
          </div>
        ) : null
      }
    >
      <div className="flex flex-col h-full font-body">
        {/* Dynamic Free Shipping Bar */}
        <div className="p-4 bg-primary text-white text-xs">
          <div className="flex items-center justify-between mb-1.5 font-medium">
            <span className="flex items-center gap-1.5 text-secondary font-bold">
              <Truck size={14} />
              {isFreeShipping ? 'FREE Shipping Unlocked!' : `₹${amountNeeded.toLocaleString()} away from Free Shipping`}
            </span>
            <span className="text-[11px] opacity-80">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {itemsCount === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4 border border-primary/10">
                <ShoppingBag size={28} />
              </div>
              <h4 className="text-lg font-serif font-bold text-primary mb-1">Your Basket is Empty</h4>
              <p className="text-xs text-gray-500 max-w-xs mb-6">
                Discover our classical formulations crafted to harmonize your body and restore vitality.
              </p>
              <button
                type="button"
                onClick={handleExploreShop}
                className="px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary/90 transition shadow-xs cursor-pointer flex items-center gap-2"
              >
                <span>Explore Formulations</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const itemId = item.product || item._id;
              const variantName = item.selectedVariant || (item.name.includes('(') ? item.name.split('(')[1]?.replace(')', '') : 'Standard Pack');

              return (
                <div
                  key={itemId}
                  className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-2xs hover:border-accent/40 transition flex gap-3.5 items-center"
                >
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${itemId}`}
                    onClick={closeCartDrawer}
                    className="w-16 h-16 bg-[#FDFBF7] rounded-xl border border-gray-100 p-1 shrink-0 flex items-center justify-center overflow-hidden hover:opacity-90"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${itemId}`}
                      onClick={closeCartDrawer}
                      className="font-serif font-bold text-xs sm:text-sm text-gray-900 hover:text-primary transition truncate block"
                    >
                      {item.name}
                    </Link>

                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="accent" size="xs">
                        {variantName}
                      </Badge>
                      <span className="text-xs font-bold text-primary">
                        ₹{item.price}
                      </span>
                    </div>

                    {/* Quantity & Remove controls */}
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/50">
                        <button
                          type="button"
                          onClick={() => updateCartItemQuantity(itemId, Math.max(1, item.qty - 1))}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-primary hover:bg-white rounded-l-lg transition cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-gray-900">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartItemQuantity(itemId, item.qty + 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-primary hover:bg-white rounded-r-lg transition cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-900">
                          ₹{item.price * item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(itemId)}
                          className="p-1 text-gray-400 hover:text-rose-600 transition cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default CartDrawer;
