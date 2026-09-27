/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserRole,
  Product,
  Farmer,
  Order,
  Review,
  OrderStatus,
  CustomerVoiceSearchIntent,
  CustomerRequest,
  LocalDemandItem,
} from './types';
import { Language, translations } from './data/translations';
import { StorageService } from './services/storageService';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { FarmerDashboard } from './components/FarmerDashboard';
import { CustomerMarketplace } from './components/CustomerMarketplace';
import { VoiceProductModal } from './components/VoiceProductModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { FarmerProfileModal } from './components/FarmerProfileModal';
import { OrderModal } from './components/OrderModal';
import { CustomerOrdersView } from './components/CustomerOrdersView';
import { CustomerVoiceSearchModal } from './components/CustomerVoiceSearchModal';
import { FarmerAssistantModal } from './components/FarmerAssistantModal';
import { CustomerRequestModal } from './components/CustomerRequestModal';
import { CheckCircle2, Sparkles, Mic } from 'lucide-react';

export default function App() {
  // App-level state
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [language, setLanguage] = useState<Language>('en');
  const [showHero, setShowHero] = useState<boolean>(true);

  // Entities state
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [customerRequests, setCustomerRequests] = useState<CustomerRequest[]>([]);
  const [localDemand, setLocalDemand] = useState<LocalDemandItem[]>([]);

  // Active Farmer for Farmer role (defaults to Ravi Kumar)
  const activeFarmer = farmers.find((f) => f.id === 'farmer-1') || farmers[0];

  // Modals & Drawers
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isCustomerVoiceSearchOpen, setIsCustomerVoiceSearchOpen] = useState(false);
  const [isFarmerAssistantOpen, setIsFarmerAssistantOpen] = useState(false);
  const [isCustomerRequestOpen, setIsCustomerRequestOpen] = useState(false);

  const [activeVoiceIntent, setActiveVoiceIntent] = useState<CustomerVoiceSearchIntent | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [orderModalProduct, setOrderModalProduct] = useState<Product | null>(null);
  const [orderModalQty, setOrderModalQty] = useState<number>(2);
  const [isCustomerOrdersOpen, setIsCustomerOrdersOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load from persistent storage
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    setFarmers(StorageService.getFarmers());
    setProducts(StorageService.getProducts());
    setOrders(StorageService.getOrders());
    setReviews(StorageService.getReviews());
    setCustomerRequests(StorageService.getCustomerRequests());
    setLocalDemand(StorageService.getLocalDemand());
  };

  const handleResetDemo = () => {
    StorageService.resetDemo();
    setActiveVoiceIntent(null);
    loadAllData();
    showToast(
      language === 'te'
        ? 'డెమో డేటా విజయవంతంగా రీసెట్ చేయబడింది.'
        : 'Demo data reset to initial showcase state.'
    );
  };

  // Handlers
  const handleProductCreated = (newProduct: Product) => {
    StorageService.addProduct(newProduct);
    loadAllData();
    showToast(
      language === 'te'
        ? `“${newProduct.name}” మార్కెట్‌లో విజయవంతంగా జోడించబడింది!`
        : `"${newProduct.name}" is now live in the marketplace!`
    );
  };

  const handleDeleteProduct = (productId: string) => {
    StorageService.deleteProduct(productId);
    loadAllData();
    showToast('Product removed.');
  };

  const handleUpdateProductPrice = (productId: string, newPrice: number) => {
    StorageService.updateProductPrice(productId, newPrice);
    loadAllData();
    showToast(`Price updated to ₹${newPrice}. Change is live across the marketplace!`);
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    StorageService.updateOrderStatus(orderId, nextStatus);
    loadAllData();
    showToast(`Order status updated to: ${nextStatus}`);
  };

  const handleOrderPlaced = (order: Order) => {
    StorageService.addOrder(order);
    loadAllData();
    showToast(`Order #${order.id} placed! Farmer has been notified.`);
  };

  const handleAddReview = (review: Review) => {
    StorageService.addReview(review);
    loadAllData();
    showToast('Thank you! Your verified review has been posted.');
  };

  const handleCustomerVoiceSearchApply = (intent: CustomerVoiceSearchIntent) => {
    setActiveVoiceIntent(intent);
    StorageService.recordCustomerSearch(intent.product);
    setLocalDemand(StorageService.getLocalDemand());
    showToast(
      language === 'te'
        ? `శోధన ఫిల్టర్: ${intent.productTelugu || intent.product}`
        : `Showing marketplace results for: ${intent.product}`
    );
  };

  const handleClearVoiceIntent = () => {
    setActiveVoiceIntent(null);
    showToast('Voice filter cleared. Showing all produce.');
  };

  const handlePostCustomerRequest = (request: CustomerRequest) => {
    StorageService.addCustomerRequest(request);
    loadAllData();
    showToast(
      language === 'te'
        ? `మీ రిక్వెస్ట్ స్థానిక రైతులకు ప్రసారం చేయబడింది!`
        : `Local demand posted! Nearby farmers have been notified.`
    );
  };

  const handleOfferProduce = (request: CustomerRequest) => {
    // Open product voice creation pre-filled or pre-focused
    setIsVoiceModalOpen(true);
    showToast(`Responding to request for ${request.quantity} ${request.unit} of ${request.product}`);
  };

  const handleQuickOrder = (product: Product) => {
    setOrderModalProduct(product);
    setOrderModalQty(1);
  };

  const handleDetailOrderNow = (product: Product, quantity: number) => {
    setSelectedProduct(null);
    setOrderModalProduct(product);
    setOrderModalQty(quantity);
  };

  // Badge counts
  const activeCustomerOrdersCount = orders.filter(
    (o) => o.status !== 'Completed' && o.status !== 'Rejected'
  ).length;

  const farmerPendingOrdersCount = orders.filter(
    (o) => o.farmerId === activeFarmer?.id && o.status === 'Order Placed'
  ).length;

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#1e3a24] text-amber-300 px-4 py-3 rounded-xl shadow-2xl border border-amber-400/40 flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header & Role Switcher */}
      <Header
        role={role}
        setRole={setRole}
        language={language}
        setLanguage={setLanguage}
        activeOrdersCount={activeCustomerOrdersCount}
        farmerPendingOrdersCount={farmerPendingOrdersCount}
        onOpenOrders={() => setIsCustomerOrdersOpen(true)}
        onResetDemo={handleResetDemo}
      />

      {/* Hero Banner (Shown in Customer mode or when toggled) */}
      {role === 'CUSTOMER' && showHero && (
        <LandingHero
          language={language}
          onExploreProducts={() => {
            setShowHero(false);
          }}
          onFarmerStart={() => {
            setRole('FARMER');
            setIsVoiceModalOpen(true);
          }}
        />
      )}

      {/* Main Role Content */}
      <main className="flex-1 pb-16">
        {role === 'FARMER' ? (
          activeFarmer && (
            <FarmerDashboard
              farmer={activeFarmer}
              products={products}
              orders={orders}
              localDemand={localDemand}
              customerRequests={customerRequests}
              language={language}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              onOpenAssistant={() => setIsFarmerAssistantOpen(true)}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onDeleteProduct={handleDeleteProduct}
              onOfferProduce={handleOfferProduce}
            />
          )
        ) : (
          <CustomerMarketplace
            products={products}
            farmers={farmers}
            language={language}
            activeVoiceIntent={activeVoiceIntent}
            onOpenVoiceSearch={() => setIsCustomerVoiceSearchOpen(true)}
            onOpenCustomerRequest={() => setIsCustomerRequestOpen(true)}
            onClearVoiceIntent={handleClearVoiceIntent}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onSelectFarmer={(f) => setSelectedFarmer(f)}
            onQuickOrder={handleQuickOrder}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs py-8 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-stone-200">
            <span className="font-bold text-sm text-white">Farm Trust</span>
            <span>·</span>
            <span>Farm to Family, in Every Language</span>
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Visakhapatnam, Andhra Pradesh</span>
            <span>·</span>
            <span>Voice-First AI Agricultural Marketplace</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Farmer Voice Product Listing Modal */}
      {activeFarmer && (
        <VoiceProductModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onProductCreated={handleProductCreated}
          language={language}
          farmerId={activeFarmer.id}
          farmerName={activeFarmer.name}
          farmerLocation={activeFarmer.location}
          farmerRating={activeFarmer.rating}
          farmerAvatar={activeFarmer.avatar}
        />
      )}

      {/* 2. Customer Voice Search Modal (Feature 1) */}
      <CustomerVoiceSearchModal
        isOpen={isCustomerVoiceSearchOpen}
        onClose={() => setIsCustomerVoiceSearchOpen(false)}
        onApplyIntent={handleCustomerVoiceSearchApply}
        language={language}
      />

      {/* 3. Farmer AI Assistant Modal (Feature 2) */}
      {activeFarmer && (
        <FarmerAssistantModal
          isOpen={isFarmerAssistantOpen}
          onClose={() => setIsFarmerAssistantOpen(false)}
          farmer={activeFarmer}
          products={products.filter((p) => p.farmerId === activeFarmer.id)}
          orders={orders.filter((o) => o.farmerId === activeFarmer.id)}
          language={language}
          onUpdateProductPrice={handleUpdateProductPrice}
          onOpenPendingOrders={() => {
            // Already on Farmer dashboard orders tab
          }}
        />
      )}

      {/* 4. Customer Request Produce Modal (Feature 5) */}
      <CustomerRequestModal
        isOpen={isCustomerRequestOpen}
        onClose={() => setIsCustomerRequestOpen(false)}
        onPostRequest={handlePostCustomerRequest}
        language={language}
      />

      {/* 5. Product Detail Modal (with Feature 4 Trust Breakdown) */}
      <ProductDetailModal
        product={selectedProduct}
        farmer={farmers.find((f) => f.id === selectedProduct?.farmerId) || null}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onOrderNow={handleDetailOrderNow}
        onOpenFarmerProfile={(f) => {
          setSelectedProduct(null);
          setSelectedFarmer(f);
        }}
        language={language}
      />

      {/* 6. Farmer Trust Passport Modal (Feature 3) */}
      <FarmerProfileModal
        farmer={selectedFarmer}
        products={products}
        reviews={reviews}
        isOpen={Boolean(selectedFarmer)}
        onClose={() => setSelectedFarmer(null)}
        onSelectProduct={(p) => {
          setSelectedFarmer(null);
          setSelectedProduct(p);
        }}
        language={language}
      />

      {/* 7. Checkout / Order Modal */}
      <OrderModal
        product={orderModalProduct}
        initialQuantity={orderModalQty}
        isOpen={Boolean(orderModalProduct)}
        onClose={() => setOrderModalProduct(null)}
        onOrderPlaced={handleOrderPlaced}
        language={language}
      />

      {/* 8. Customer Orders Tracking & Rating Drawer */}
      <CustomerOrdersView
        orders={orders.filter((o) => o.customerId === 'cust-1')}
        isOpen={isCustomerOrdersOpen}
        onClose={() => setIsCustomerOrdersOpen(false)}
        onAddReview={handleAddReview}
        language={language}
      />
    </div>
  );
}
