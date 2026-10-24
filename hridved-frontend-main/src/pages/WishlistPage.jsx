import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';

const WishlistPage = () => {
    const { items } = useWishlist();

    return (
        <section className="container mx-auto px-4 py-12 min-h-[55vh]">
            <div className="flex items-center gap-3 mb-8">
                <Heart className="text-rose-500" />
                <h1 className="text-3xl font-bold text-primary">Your Wishlist</h1>
            </div>
            {items.length ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {items.map((product) => <ProductCard key={product._id || product.id} product={product} />)}
                </div>
            ) : (
                <div className="text-center bg-white rounded-2xl border border-gray-100 p-10">
                    <p className="text-gray-600 mb-5">Products you save will appear here.</p>
                    <Link to="/shop" className="inline-flex bg-primary text-white px-6 py-3 rounded-full font-bold">Explore products</Link>
                </div>
            )}
        </section>
    );
};

export default WishlistPage;
