import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, X, Loader2, ArrowRight, Sparkles, Clock, Tag } from 'lucide-react';
import api from '../utils/api';
import { trackWebsiteEvent } from '../utils/websiteAnalytics';

const POPULAR_SEARCHES = [
    'Suvarnaprashan 15ml',
    'Kumkumadi Tailam',
    'Rosemary Hair Oil',
    'A2 Bilona Cow Ghee',
    'Joint Pain Roll On',
    'Swarna Bhasma'
];

const SearchBar = ({ 
    placeholder = 'Search remedies by name, herb, SKU...', 
    className = '',
    onSearchComplete,
    onSearch,
    autoFocus = false,
    initialQuery = ''
}) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState(initialQuery || '');
    const [suggestions, setSuggestions] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    // Keep query synced if initialQuery changes from outside (e.g. URL query params)
    useEffect(() => {
        if (initialQuery !== undefined) {
            setQuery(initialQuery);
        }
    }, [initialQuery]);
    const [recentSearches, setRecentSearches] = useState(() => {
        try {
            const saved = localStorage.getItem('hridved_recent_searches');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    const debounceTimer = useRef(null);

    // Save recent search
    const addRecentSearch = (term) => {
        const trimmed = term.trim();
        if (!trimmed) return;
        setRecentSearches(prev => {
            const filtered = prev.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
            const updated = [trimmed, ...filtered].slice(0, 5);
            try {
                localStorage.setItem('hridved_recent_searches', JSON.stringify(updated));
            } catch {}
            return updated;
        });
    };

    const clearRecentSearches = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setRecentSearches([]);
        try {
            localStorage.removeItem('hridved_recent_searches');
        } catch {}
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch autocomplete suggestions with debounce
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        const trimmed = query.trim();
        if (trimmed.length < 2) {
            setSuggestions(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        debounceTimer.current = setTimeout(async () => {
            try {
                const { data } = await api.get(`/products/search/suggestions?q=${encodeURIComponent(trimmed)}`);
                setSuggestions(data);
            } catch (err) {
                console.warn('Search suggestions error:', err.message);
                setSuggestions({ products: [], categories: [], ingredients: [] });
            } finally {
                setIsLoading(false);
            }
        }, 220);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [query]);

    const executeSearch = (searchTerm) => {
        const term = searchTerm.trim();
        if (!term) return;

        addRecentSearch(term);
        trackWebsiteEvent('search', { query: term });
        setIsOpen(false);
        if (onSearch) onSearch(term);
        if (onSearchComplete) onSearchComplete();
        navigate(`/shop?keyword=${encodeURIComponent(term)}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        executeSearch(query);
    };

    // Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
            return;
        }

        const totalItems = (suggestions?.products?.length || 0) + (suggestions?.ingredients?.length || 0);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            const productsLen = suggestions?.products?.length || 0;
            if (selectedIndex < productsLen) {
                const selectedProd = suggestions.products[selectedIndex];
                navigate(`/product/${selectedProd._id}`);
                setIsOpen(false);
            } else {
                const selectedIng = suggestions.ingredients[selectedIndex - productsLen];
                executeSearch(selectedIng);
            }
        }
    };

    const hasResults = suggestions && (
        (suggestions.products && suggestions.products.length > 0) ||
        (suggestions.categories && suggestions.categories.length > 0) ||
        (suggestions.ingredients && suggestions.ingredients.length > 0)
    );

    const isNoResults = suggestions && !isLoading && !hasResults && query.trim().length >= 2;

    return (
        <div ref={wrapperRef} className={`relative w-full ${className}`}>
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="relative w-full" role="search">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    autoFocus={autoFocus}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        setSelectedIndex(-1);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    aria-label="Search remedies and ingredients"
                    aria-autocomplete="list"
                    aria-expanded={isOpen}
                    role="combobox"
                    className="w-full pl-10 pr-9 py-2.5 rounded-full border border-gray-200 bg-gray-50/80 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
                />

                <Search 
                    size={16} 
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                    aria-hidden="true" 
                />

                {/* Loading indicator or clear button */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    {isLoading ? (
                        <Loader2 size={15} className="animate-spin text-primary" />
                    ) : query ? (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                                setSuggestions(null);
                                inputRef.current?.focus();
                            }}
                            aria-label="Clear search query"
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    ) : null}
                </div>
            </form>

            {/* Suggestions / Recent Searches Dropdown Panel */}
            {isOpen && (
                <div 
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-[100] max-h-[460px] overflow-y-auto custom-scrollbar animate-in fade-in duration-150"
                    role="listbox"
                >
                    {/* State 1: Active query with matching suggestions */}
                    {hasResults && (
                        <div className="space-y-4">
                            {/* Matching Products */}
                            {suggestions.products?.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 px-1">
                                        Formulations
                                    </p>
                                    <div className="space-y-1">
                                        {suggestions.products.map((prod, idx) => (
                                            <Link
                                                key={prod._id}
                                                to={`/product/${prod._id}`}
                                                onClick={() => {
                                                    addRecentSearch(prod.name);
                                                    setIsOpen(false);
                                                    if (onSearchComplete) onSearchComplete();
                                                }}
                                                className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                                                    selectedIndex === idx ? 'bg-primary/5 text-primary' : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                    <img src={prod.image} alt="" className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-gray-800 truncate leading-tight">{prod.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[11px] font-black text-primary">₹{prod.price}</span>
                                                        {prod.packSize && (
                                                            <span className="text-[9px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded font-medium">{prod.packSize}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <ArrowRight size={13} className="text-gray-300" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Matching Ingredients */}
                            {suggestions.ingredients?.length > 0 && (
                                <div className="border-t border-gray-100 pt-3">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-secondary mb-2 px-1 flex items-center gap-1">
                                        <Sparkles size={11} className="text-secondary" />
                                        Approved Classical Ingredients
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 px-1">
                                        {suggestions.ingredients.map((ing, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => executeSearch(ing)}
                                                className="px-2.5 py-1 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-primary text-xs font-semibold transition-colors cursor-pointer"
                                            >
                                                🌿 {ing}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* View all button */}
                            <div className="pt-2 border-t border-gray-100 text-center">
                                <button
                                    type="button"
                                    onClick={() => executeSearch(query)}
                                    className="text-xs font-bold text-primary hover:text-secondary inline-flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                    <span>View all results for "{query}"</span>
                                    <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* State 2: No results suggestions with typo tolerance guidance */}
                    {isNoResults && (
                        <div className="py-4 text-center">
                            <p className="text-xs font-bold text-gray-700 mb-1">
                                No exact formulations found for "{query}"
                            </p>
                            <p className="text-[11px] text-gray-400 mb-3 font-light">
                                Check spelling or try exploring these popular remedies:
                            </p>
                            <div className="flex flex-wrap justify-center gap-1.5">
                                {POPULAR_SEARCHES.slice(0, 4).map((term, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => executeSearch(term)}
                                        className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 hover:bg-primary hover:text-white transition-colors cursor-pointer"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* State 3: Empty query (Recent searches & Popular searches) */}
                    {!query && (
                        <div className="space-y-4">
                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between pb-1.5 mb-1 px-1">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                                            <Clock size={11} /> Recent Searches
                                        </p>
                                        <button
                                            type="button"
                                            onClick={clearRecentSearches}
                                            className="text-[10px] font-bold text-gray-400 hover:text-red-500 cursor-pointer"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <div className="space-y-0.5">
                                        {recentSearches.map((term, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => executeSearch(term)}
                                                className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-gray-50 text-xs font-medium text-gray-700 flex items-center justify-between group cursor-pointer"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Clock size={12} className="text-gray-300 group-hover:text-primary" />
                                                    {term}
                                                </span>
                                                <ArrowRight size={11} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Popular Searches */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-secondary mb-2 px-1 flex items-center gap-1">
                                    <Sparkles size={11} className="text-secondary" />
                                    Popular Formulations
                                </p>
                                <div className="flex flex-wrap gap-1.5 px-1">
                                    {POPULAR_SEARCHES.map((term, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => executeSearch(term)}
                                            className="px-2.5 py-1 rounded-full bg-gray-50 hover:bg-secondary/15 hover:text-primary text-gray-600 text-xs font-medium transition-colors border border-gray-100 cursor-pointer"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
