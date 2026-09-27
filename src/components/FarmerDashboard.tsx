import React, { useState } from 'react';
import {
  Mic,
  Plus,
  Package,
  Clock,
  CheckCircle,
  Star,
  IndianRupee,
  ShieldCheck,
  ChevronRight,
  Truck,
  MapPin,
  Phone,
  UserCheck,
  Trash2,
  Leaf,
  Layers,
  Sparkles,
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
  Bell
} from 'lucide-react';
import { Farmer, Product, Order, OrderStatus, LocalDemandItem, CustomerRequest } from '../types';
import { Language, translations } from '../data/translations';

interface FarmerDashboardProps {
  farmer: Farmer;
  products: Product[];
  orders: Order[];
  localDemand: LocalDemandItem[];
  customerRequests: CustomerRequest[];
  language: Language;
  onOpenVoiceModal: () => void;
  onOpenAssistant: () => void;
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onDeleteProduct: (productId: string) => void;
  onOfferProduce: (request: CustomerRequest) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  farmer,
  products,
  orders,
  localDemand,
  customerRequests,
  language,
  onOpenVoiceModal,
  onOpenAssistant,
  onUpdateOrderStatus,
  onDeleteProduct,
  onOfferProduce,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'demand' | 'profile'>('orders');

  const farmerProducts = products.filter((p) => p.farmerId === farmer.id);
  const farmerOrders = orders.filter((o) => o.farmerId === farmer.id);
  const pendingOrders = farmerOrders.filter((o) => o.status === 'Order Placed');
  const activeOrders = farmerOrders.filter(
    (o) => o.status !== 'Completed' && o.status !== 'Rejected'
  );
  const completedOrders = farmerOrders.filter((o) => o.status === 'Completed');

  const totalSales = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Order Placed':
        return (
          <span className="text-amber-800 font-semibold text-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            {t.statusPlaced}
          </span>
        );
      case 'Accepted by Farmer':
        return (
          <span className="text-blue-800 font-semibold text-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {t.statusAccepted}
          </span>
        );
      case 'Preparing':
        return (
          <span className="text-indigo-800 font-semibold text-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            {t.statusPreparing}
          </span>
        );
      case 'Ready':
        return (
          <span className="text-emerald-800 font-semibold text-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {t.statusReady}
          </span>
        );
      case 'Completed':
        return (
          <span className="text-stone-600 font-semibold text-xs flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            {t.statusCompleted}
          </span>
        );
      default:
        return <span className="text-stone-500 text-xs">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Farmer Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1b3d27] via-[#244f34] to-[#1b3d27] text-white rounded-2xl p-5 sm:p-7 shadow-md border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
          <Leaf className="w-64 h-64 text-emerald-300" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={farmer.avatar}
              alt={farmer.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {t.namaste}, {language === 'te' ? farmer.teluguName : farmer.name}!
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-stone-950">
                  <ShieldCheck className="w-3 h-3 text-stone-950" />
                  {t.verifiedFarmer}
                </span>
              </div>
              <p className="text-emerald-200/90 text-xs sm:text-sm mt-0.5 font-medium">
                {language === 'te' ? farmer.farmNameTelugu : farmer.farmName} · {farmer.location}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-emerald-100">
                <span className="flex items-center gap-1 text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  {farmer.rating} ({farmer.reviewCount} {language === 'te' ? 'రివ్యూలు' : 'reviews'})
                </span>
                <span>·</span>
                <span>{farmer.orderCompletionRate || 98}% {language === 'te' ? 'ఆర్డర్ల రికార్డు' : 'fulfillment rate'}</span>
              </div>
            </div>
          </div>

          {/* Quick CTAs in Banner */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenAssistant}
              className="px-4 py-3 bg-white/15 hover:bg-white/25 text-amber-300 backdrop-blur-md border border-white/20 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t.farmerAssistantTitle}</span>
            </button>

            <button
              onClick={onOpenVoiceModal}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-xl font-extrabold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Mic className="w-4 h-4 text-stone-950" />
              <span>{t.addByVoice}</span>
            </button>
          </div>
        </div>
      </div>

      {/* FEATURE 2: AI ASSISTANT QUICK PROMPT BAR */}
      <div className="bg-gradient-to-r from-emerald-50 via-white to-amber-50/60 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#1e3a24] text-amber-300 flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <span>{t.farmerAssistantTitle}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold">
                Action-Oriented
              </span>
            </h3>
            <p className="text-[11px] text-stone-500">
              {language === 'te'
                ? 'మీ పెండింగ్ ఆర్డర్లు చూడండి లేదా పంటల ధరలను వాయిస్ ద్వారా మార్చండి'
                : 'Check pending orders or update crop prices by speaking'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={onOpenAssistant}
            className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 hover:text-emerald-950 transition-colors cursor-pointer"
          >
            📦 {language === 'te' ? 'ఆర్డర్లు చూపించు' : 'Show Pending Orders'}
          </button>
          <button
            onClick={onOpenAssistant}
            className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 hover:text-emerald-950 transition-colors cursor-pointer"
          >
            💰 {language === 'te' ? 'టమాటాల ధర మార్చు' : 'Change Tomato Price'}
          </button>
          <button
            onClick={onOpenAssistant}
            className="px-3 py-1.5 bg-[#1e3a24] text-amber-300 rounded-lg text-xs font-bold hover:bg-emerald-900 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Speak Command</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium">{t.incomingOrders}</p>
            <p className="text-2xl font-black text-stone-900 mt-1">{pendingOrders.length}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pendingOrders.length > 0 ? 'bg-amber-100 text-amber-800 animate-bounce' : 'bg-stone-100 text-stone-600'}`}>
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium">{t.activeProducts}</p>
            <p className="text-2xl font-black text-stone-900 mt-1">{farmerProducts.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium">{t.completedOrders}</p>
            <p className="text-2xl font-black text-stone-900 mt-1">{completedOrders.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium">{t.totalEarnings}</p>
            <p className="text-2xl font-black text-emerald-950 mt-1">₹{totalSales}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 border-b border-stone-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#1e3a24] text-amber-300 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t.customerOrders}</span>
          {activeOrders.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-400 text-stone-950 text-xs rounded-full font-black">
              {activeOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'products'
              ? 'bg-[#1e3a24] text-amber-300 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t.myFarmProducts}</span>
          <span className="text-xs text-stone-400">({farmerProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('demand')}
          className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'demand'
              ? 'bg-[#1e3a24] text-amber-300 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{t.localMarketplaceDemand}</span>
          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold">
            {customerRequests.length} Requests
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#1e3a24] text-amber-300 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{t.trustPassportTitle}</span>
        </button>
      </div>

      {/* TAB 1: INCOMING & ACTIVE ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {farmerOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-stone-500">
              <Package className="w-12 h-12 mx-auto text-stone-300 mb-2" />
              <p className="text-sm font-semibold">{t.noOrdersYet}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {farmerOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs transition-all hover:border-emerald-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={order.productImage}
                        alt={order.productName}
                        className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-stone-400">
                            #{order.id}
                          </span>
                          <span>·</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <h3 className="text-base font-bold text-stone-900 mt-0.5">
                          {order.quantity} {order.unit} {order.productName}
                        </h3>
                        <p className="text-xs text-stone-500">
                          {language === 'te' ? 'మొత్తం:' : 'Total:'} <span className="font-extrabold text-emerald-950">₹{order.totalPrice}</span> ({order.paymentMethod})
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-xs text-stone-500">
                      <p className="font-semibold text-stone-800">{order.customerName}</p>
                      <p className="flex items-center gap-1 sm:justify-end text-stone-500 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-700" />
                        <span>{order.deliveryAddress}</span>
                      </p>
                      <p className="text-stone-400 text-[11px] mt-0.5">{order.createdAt}</p>
                    </div>
                  </div>

                  {/* Order Status Advancement Stepper Buttons */}
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-stone-500">
                      {order.status === 'Completed' ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          {language === 'te' ? 'డెలివరీ విజయవంతంగా పూర్తయింది' : 'Delivered & Completed'}
                        </span>
                      ) : (
                        <span>
                          {language === 'te' ? 'తదుపరి చర్య:' : 'Next Action:'}{' '}
                          <strong className="text-stone-800">
                            {order.status === 'Order Placed' && (language === 'te' ? 'ఆర్డర్‌ను పరిశీలించి ఆమోదించండి' : 'Review & Accept order')}
                            {order.status === 'Accepted by Farmer' && (language === 'te' ? 'పంట కోత మరియు ప్యాకింగ్ ప్రారంభించండి' : 'Start harvest & packing')}
                            {order.status === 'Preparing' && (language === 'te' ? 'హ్యాండోవర్ లేదా డెలివరీకి సిద్ధం చేయండి' : 'Prepare for dispatch')}
                            {order.status === 'Ready' && (language === 'te' ? 'డెలివరీ పూర్తయినట్లు మార్క్ చేయండి' : 'Mark handoff completed')}
                          </strong>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === 'Order Placed' && (
                        <>
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Rejected')}
                            className="px-3 py-2 text-xs font-semibold text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            {t.rejectOrder}
                          </button>
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Accepted by Farmer')}
                            className="px-5 py-2 text-xs font-bold bg-[#1e3a24] hover:bg-emerald-900 text-amber-300 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {t.acceptOrder}
                          </button>
                        </>
                      )}

                      {order.status === 'Accepted by Farmer' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'Preparing')}
                          className="px-5 py-2 text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Package className="w-3.5 h-3.5" />
                          {t.markPreparing}
                        </button>
                      )}

                      {order.status === 'Preparing' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'Ready')}
                          className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          {t.markReady}
                        </button>
                      )}

                      {order.status === 'Ready' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'Completed')}
                          className="px-5 py-2 text-xs font-bold bg-green-700 hover:bg-green-800 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {t.markCompleted}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">
              {t.myFarmProducts} ({farmerProducts.length})
            </h2>
            <button
              onClick={onOpenVoiceModal}
              className="px-4 py-2 bg-[#1e3a24] hover:bg-emerald-950 text-amber-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{t.addByVoice}</span>
            </button>
          </div>

          {farmerProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-stone-500">
              <Package className="w-12 h-12 mx-auto text-stone-300 mb-2" />
              <p className="text-sm font-semibold">{t.noProductsYet}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {farmerProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="h-40 relative bg-stone-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.organicClaim && (
                        <div className="absolute top-2 left-2 bg-emerald-800 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                          <Leaf className="w-3 h-3" />
                          <span>{t.organic}</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-stone-800 text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
                        {product.availableQuantity} {product.unit} left
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                          {product.category}
                        </span>
                        <span className="text-xs text-stone-400">
                          {product.harvestDate}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-stone-900 leading-snug">
                        {product.name}
                      </h3>

                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-lg font-black text-emerald-950">
                          ₹{product.price}
                          <span className="text-xs text-stone-500 font-normal"> / {product.priceUnit}</span>
                        </span>
                        <span className="text-xs text-stone-500">
                          {product.availableQuantity > 0 ? (
                            <span className="text-emerald-700 font-semibold">● {t.inStock}</span>
                          ) : (
                            <span className="text-red-600 font-semibold">● Out of stock</span>
                          )}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      {product.trustStatus === 'verified' ? 'Verified Listing' : 'Farmer Claim'}
                    </span>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      title="Remove product"
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-md hover:bg-stone-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FEATURE 6: LOCAL MARKETPLACE DEMAND */}
      {activeTab === 'demand' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-stone-900 tracking-tight flex items-center gap-2">
                <span>{t.whatCustomersAreLookingFor}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                  Live Local Signals
                </span>
              </h2>
              <p className="text-xs text-stone-500">
                {language === 'te'
                  ? 'కస్టమర్ల నిజమైన శోధనలు మరియు నిర్దిష్ట ఆర్డర్ రిక్వెస్ట్‌ల ఆధారంగా సేకరించబడిన వివరాలు'
                  : 'Derived from recent searches and active product requests in your region'}
              </p>
            </div>
          </div>

          {/* Active Broadcast Requests from Customers */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>Direct Customer Broadcasts ({customerRequests.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {customerRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl border border-stone-200 p-4 space-y-3 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-900">{req.customerName}</span>
                      <span className="text-[10px] text-stone-400">{req.createdAt}</span>
                    </div>

                    <h4 className="text-sm font-extrabold text-stone-900">
                      {req.quantity} {req.unit} of {req.product}
                    </h4>

                    <p className="text-xs text-stone-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{t.neededBy}: <strong className="text-stone-700">{req.neededBy}</strong></span>
                    </p>

                    <p className="text-xs text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{req.location}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                      Open Demand
                    </span>
                    <button
                      onClick={() => onOfferProduce(req)}
                      className="px-3 py-1.5 bg-[#1e3a24] hover:bg-emerald-950 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{t.offerProductBtn}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aggregated Demand Insights */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Aggregated Local Demand Trends
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {localDemand.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-stone-900">
                      {language === 'te' ? item.productTelugu : item.product}
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {language === 'te' && item.recentRequestNoteTelugu
                        ? item.recentRequestNoteTelugu
                        : item.recentRequestNote}
                    </p>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded font-black shrink-0 ${
                    item.urgency === 'High interest'
                      ? 'bg-red-100 text-red-900'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {language === 'te' ? item.urgencyTelugu : item.urgency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FARM & TRUST PROFILE (Trust Passport Overview) */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={farmer.avatar}
              alt={farmer.name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-700 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-stone-900">
                  {language === 'te' ? farmer.teluguName : farmer.name}
                </h2>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                  {t.identityVerified}
                </span>
              </div>
              <p className="text-sm text-stone-600 font-medium">
                {language === 'te' ? farmer.farmNameTelugu : farmer.farmName}
              </p>
              <p className="text-xs text-stone-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                {farmer.location}, {farmer.state}
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 pt-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-stone-900">{farmer.rating}</span>
                <span className="text-stone-400">({farmer.reviewCount} customer reviews)</span>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t.trustPassportTitle}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-[11px] text-stone-500 block">Fulfillment Rate</span>
                <span className="text-base font-extrabold text-stone-900">{farmer.orderCompletionRate || 98}%</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-[11px] text-stone-500 block">Delivered Orders</span>
                <span className="text-base font-extrabold text-stone-900">{farmer.totalCompletedOrders || 42}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-[11px] text-stone-500 block">Land Area</span>
                <span className="text-base font-extrabold text-stone-900">{farmer.acres} Acres</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-[11px] text-stone-500 block">Experience</span>
                <span className="text-base font-extrabold text-stone-900">{farmer.experienceYears} Years</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
