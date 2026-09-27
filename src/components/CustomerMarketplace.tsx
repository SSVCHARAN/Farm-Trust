import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Star,
  ShieldCheck,
  MapPin,
  Leaf,
  ShoppingBag,
  ArrowRight,
  Filter,
  Sparkles,
  CheckCircle2,
  Clock,
  Mic,
  Calendar,
  X,
  AlertTriangle
} from 'lucide-react';
import { Product, Farmer, ProductCategory, CustomerVoiceSearchIntent } from '../types';
import { Language, translations } from '../data/translations';

interface CustomerMarketplaceProps {
  products: Product[];
  farmers: Farmer[];
  language: Language;
  activeVoiceIntent: CustomerVoiceSearchIntent | null;
  onOpenVoiceSearch: () => void;
  onOpenCustomerRequest: () => void;
  onClearVoiceIntent: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectFarmer: (farmer: Farmer) => void;
  onQuickOrder: (product: Product) => void;
}

export const CustomerMarketplace: React.FC<CustomerMarketplaceProps> = ({
  products,
  farmers,
  language,
  activeVoiceIntent,
  onOpenVoiceSearch,
  onOpenCustomerRequest,
  onClearVoiceIntent,
  onSelectProduct,
  onSelectFarmer,
  onQuickOrder,
}) => {
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'rating'>('recommended');

  const categories = [
    { id: 'All', label: t.allCategories },
    { id: 'Vegetables', label: t.vegetables },
    { id: 'Fruits', label: t.fruits },
    { id: 'Grains', label: t.grains },
    { id: 'Dairy', label: t.dairy },
    { id: 'Organic', label: t.organic },
  ];

  // Filter & Search Logic
  const filteredProducts = products.filter((p) => {
    // 1. Voice Intent Filter if active
    if (activeVoiceIntent) {
      const intentProd = activeVoiceIntent.product.toLowerCase();
      const matchesIntentProd =
        p.name.toLowerCase().includes(intentProd) ||
        p.teluguName.toLowerCase().includes(intentProd) ||
        intentProd.includes(p.name.toLowerCase().split(' ')[0]);

      if (!matchesIntentProd) return false;

      if (activeVoiceIntent.maxPrice && p.price > activeVoiceIntent.maxPrice) {
        return false;
      }

      if (activeVoiceIntent.organicOnly && !p.organicClaim) {
        return false;
      }
    }

    // 2. Category Filter
    const matchesCategory =
      selectedCategory === 'All' ||
      p.category === selectedCategory ||
      (selectedCategory === 'Organic' && p.organicClaim);

    // 3. Search text query
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.teluguName?.toLowerCase().includes(q) ||
      p.farmerName.toLowerCase().includes(q) ||
      p.farmerLocation.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'rating') return b.farmerRating - a.farmerRating;
    return b.createdAt - a.createdAt; // recommended / newest
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Search & Hero Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-11 pr-24 py-3 bg-white border border-stone-200 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-14 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                Clear
              </button>
            )}

            {/* Quick Micro-Mic Inside Input */}
            <button
              onClick={onOpenVoiceSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#1e3a24] hover:bg-emerald-900 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
              title="Voice Search"
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Voice</span>
            </button>
          </div>

          {/* Action: Voice Search Big Button */}
          <button
            onClick={onOpenVoiceSearch}
            className="px-4 py-3 bg-[#1e3a24] hover:bg-emerald-950 text-amber-300 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Mic className="w-4 h-4 text-amber-300" />
            <span>{t.voiceSearchBtn}</span>
          </button>

          {/* Action: Request Produce Button */}
          <button
            onClick={onOpenCustomerRequest}
            className="px-4 py-3 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-emerald-800" />
            <span>{t.requestProductBtn}</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-stone-500 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-3 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-xs cursor-pointer"
            >
              <option value="recommended">Featured / Fresh</option>
              <option value="rating">Highest Rated Farmers</option>
              <option value="price-asc">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* ACTIVE VOICE FILTER BANNER */}
        {activeVoiceIntent && (
          <div className="bg-gradient-to-r from-emerald-100 to-amber-100/70 border border-emerald-300/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse"></span>
              <span className="font-bold text-emerald-950">
                {language === 'te' ? 'వాయిస్ ఫిల్టర్ వర్తించబడింది:' : 'Active Voice Search Filter:'}
              </span>
              <span className="font-extrabold text-stone-900 bg-white px-2 py-0.5 rounded shadow-2xs">
                {language === 'te' && activeVoiceIntent.interpretationTelugu
                  ? activeVoiceIntent.interpretationTelugu
                  : activeVoiceIntent.interpretation}
              </span>
            </div>

            <button
              onClick={onClearVoiceIntent}
              className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 font-bold rounded-lg border border-stone-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.clearVoiceFilter}</span>
            </button>
          </div>
        )}

        {/* Category Horizontal Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#1e3a24] text-amber-300 shadow-xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80 hover:bg-stone-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: VERIFIED LOCAL FARMERS STRIP (With Trust Passport Preview) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
              {t.nearbyFarmers}
            </h2>
            <p className="text-xs text-stone-500">
              {language === 'te'
                ? 'మీ సమీపంలో ఉన్న ధృవీకరించబడిన చిన్న రైతులు · తాజా తోటల పంటలు'
                : 'Fresh from farmers near you · Identity verified · 98% fulfillment reliability'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {farmers.map((farmer) => (
            <div
              key={farmer.id}
              onClick={() => onSelectFarmer(farmer)}
              className="bg-white rounded-2xl border border-stone-200 p-4 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={farmer.avatar}
                  alt={farmer.name}
                  className="w-13 h-13 rounded-xl object-cover border border-amber-400/80 group-hover:scale-105 transition-transform"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-stone-900 group-hover:text-emerald-900">
                      {language === 'te' ? farmer.teluguName : farmer.name}
                    </h3>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <p className="text-[11px] text-stone-500 line-clamp-1">
                    {language === 'te' ? farmer.farmNameTelugu : farmer.farmName}
                  </p>
                  <p className="text-[10px] text-stone-400 flex items-center gap-0.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>{farmer.location}</span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600 justify-end">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{farmer.rating}</span>
                </div>
                <span className="text-[10px] text-emerald-800 font-semibold block mt-0.5">
                  {farmer.orderCompletionRate || 98}% Fulfilled
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold group-hover:underline">
                  Trust Passport →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: PRODUCT HARVEST GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
              {t.popularProduce}
            </h2>
            <p className="text-xs text-stone-500">
              {language === 'te'
                ? 'రైతుల నుండి నేరుగా కొనుగోలు చేయండి - మధ్యవర్తులు లేరు'
                : 'Direct farm pricing · Zero middlemen markup · Fresh from field'}
            </p>
          </div>
          <span className="text-xs font-semibold text-stone-500">
            {sortedProducts.length} items
          </span>
        </div>

        {sortedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 space-y-2">
            <Leaf className="w-10 h-10 mx-auto text-stone-300" />
            <h3 className="text-sm font-bold text-stone-700">No produce matches your search</h3>
            <p className="text-xs text-stone-500">
              Try searching for "tomatoes", "rice", "mangoes", or clear your voice filter.
            </p>
            {activeVoiceIntent && (
              <button
                onClick={onClearVoiceIntent}
                className="mt-2 text-xs font-bold text-emerald-800 underline cursor-pointer"
              >
                Clear Voice Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Product Card Image */}
                  <div
                    onClick={() => onSelectProduct(product)}
                    className="h-44 relative bg-stone-100 cursor-pointer overflow-hidden"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Clear distinction: Farmer Declared Organic vs Verified */}
                    {product.organicClaim && (
                      <div className="absolute top-2.5 left-2.5 bg-[#1e3a24] text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                        <Leaf className="w-3 h-3" />
                        <span>{t.farmerDeclared}</span>
                      </div>
                    )}

                    <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-xs text-stone-800 text-[10px] font-extrabold px-2 py-0.5 rounded shadow-xs">
                      {product.availableQuantity} {product.unit} left
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-800 uppercase tracking-wider">
                        {product.category}
                      </span>
                      <span className="text-stone-400">{product.harvestDate}</span>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="text-base font-bold text-stone-900 group-hover:text-emerald-950 transition-colors cursor-pointer leading-snug"
                    >
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 pt-0.5">
                      <span className="text-xl font-black text-emerald-950">
                        ₹{product.price}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        / {product.priceUnit}
                      </span>
                    </div>

                    {/* Farmer Trust Mini Bar */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={product.farmerAvatar}
                          alt={product.farmerName}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-stone-700 font-semibold truncate max-w-[110px]">
                          {product.farmerName}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      </div>

                      <div className="flex items-center gap-0.5 font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{product.farmerRating}</span>
                      </div>
                    </div>

                    {/* Location */}
                    <p className="text-[11px] text-stone-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate">{product.farmerLocation}</span>
                    </p>
                  </div>
                </div>

                {/* Card Button */}
                <div className="p-3 bg-stone-50/70 border-t border-stone-100 flex items-center gap-2">
                  <button
                    onClick={() => onSelectProduct(product)}
                    className="flex-1 py-2 text-xs font-bold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onQuickOrder(product)}
                    className="flex-1 py-2 text-xs font-bold bg-[#1e3a24] hover:bg-emerald-950 text-amber-300 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Order Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
