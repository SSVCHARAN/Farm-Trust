import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  Truck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Product, Order, OrderStatus } from '../types';
import { DEMO_CUSTOMER } from '../data/mockData';
import { Language, translations } from '../data/translations';

interface OrderModalProps {
  product: Product | null;
  initialQuantity?: number;
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
  language: Language;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  product,
  initialQuantity = 2,
  isOpen,
  onClose,
  onOrderPlaced,
  language,
}) => {
  if (!isOpen || !product) return null;

  const t = translations[language];

  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [deliveryAddress, setDeliveryAddress] = useState(DEMO_CUSTOMER.address);
  const [customerPhone, setCustomerPhone] = useState(DEMO_CUSTOMER.phone);
  const [customerName, setCustomerName] = useState(DEMO_CUSTOMER.name);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash on Delivery'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const subtotal = product.price * quantity;
  const deliveryFee = 0; // Direct farm free dispatch in pilot zone
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const orderId = `FT-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder: Order = {
        id: orderId,
        customerId: DEMO_CUSTOMER.id,
        customerName: customerName.trim() || DEMO_CUSTOMER.name,
        customerPhone: customerPhone.trim() || DEMO_CUSTOMER.phone,
        deliveryAddress: deliveryAddress.trim() || DEMO_CUSTOMER.address,
        farmerId: product.farmerId,
        farmerName: product.farmerName,
        farmerLocation: product.farmerLocation,
        productId: product.id,
        productName: product.name,
        productTeluguName: product.teluguName || product.name,
        productImage: product.image,
        quantity,
        unit: product.unit,
        unitPrice: product.price,
        totalPrice: total,
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending Cash on Delivery' : 'Paid (Simulated)',
        status: 'Order Placed',
        statusHistory: [
          {
            status: 'Order Placed',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            note: `${paymentMethod} payment confirmed. Order dispatched to ${product.farmerName}.`,
          },
        ],
        createdAt: new Date().toISOString(),
        rated: false,
      };

      setIsProcessing(false);
      setPlacedOrder(newOrder);
      onOrderPlaced(newOrder);
    }, 1200);
  };

  const handleClose = () => {
    setPlacedOrder(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#1e3a24] text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {placedOrder ? t.orderSuccess : 'Direct Farm Checkout'}
            </h2>
            <p className="text-xs text-emerald-200/90 font-medium">
              {product.farmerName} · {product.farmerLocation}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROCESSING SCREEN */}
        {isProcessing && (
          <div className="p-10 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-800 animate-spin"></div>
              <Sparkles className="w-6 h-6 text-amber-500 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">{t.processingOrder}</h3>
              <p className="text-xs text-stone-500 mt-1">
                {language === 'te'
                  ? 'చెల్లింపు వివరాలు ధృవీకరించబడుతున్నాయి మరియు రైతుకు నోటిఫికేషన్ పంపుతున్నాం'
                  : 'Verifying simulated payment and notifying the farmer directly...'}
              </p>
            </div>
          </div>
        )}

        {/* ORDER SUCCESS SCREEN */}
        {!isProcessing && placedOrder && (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                {language === 'te' ? 'ఆర్డర్ ధృవీకరించబడింది' : 'Order Confirmed'}
              </span>
              <h3 className="text-2xl font-black text-stone-900 mt-1">
                #{placedOrder.id}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-sm mx-auto">
                {t.orderSuccessSub}
              </p>
            </div>

            {/* Summary card */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 text-left text-xs space-y-2">
              <div className="flex justify-between font-semibold text-stone-800">
                <span>{placedOrder.quantity} {placedOrder.unit} {placedOrder.productName}</span>
                <span className="font-bold text-emerald-950">₹{placedOrder.totalPrice}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Farmer:</span>
                <span className="font-medium text-stone-800">{placedOrder.farmerName}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Payment:</span>
                <span className="font-medium text-stone-800">{placedOrder.paymentMethod} ({placedOrder.paymentStatus})</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Delivery:</span>
                <span className="font-medium text-stone-800 truncate max-w-[200px]">{placedOrder.deliveryAddress}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleClose}
                className="w-full py-3 bg-[#1e3a24] hover:bg-emerald-950 text-amber-300 font-extrabold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.trackOrder}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ORDER FORM */}
        {!isProcessing && !placedOrder && (
          <div className="p-5 sm:p-6 space-y-4">
            {/* Selected Product Summary */}
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <img
                src={product.image}
                alt={product.name}
                className="w-14 h-14 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-stone-900">{product.name}</h4>
                <p className="text-xs text-stone-500">
                  ₹{product.price} / {product.priceUnit} · Direct from {product.farmerName}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="text-stone-600 font-medium">Qty: {quantity} {product.unit}</span>
                  <span>·</span>
                  <span className="font-black text-emerald-950">Subtotal: ₹{subtotal}</span>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {language === 'te' ? 'డెలివరీ సమాచారం' : 'Delivery Details'}
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-0.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-0.5">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-0.5">
                  {t.deliveryAddress}
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                />
              </div>
            </div>

            {/* Payment Method Selector (Simulated) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  {t.paymentMethod}
                </h3>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                  Simulated Gateway
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'UPI'
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1 text-emerald-800" />
                  <span className="text-[11px] block">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'Card'
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-emerald-800" />
                  <span className="text-[11px] block">Debit / Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <Banknote className="w-5 h-5 mx-auto mb-1 text-emerald-800" />
                  <span className="text-[11px] block">Cash on Delivery</span>
                </button>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="pt-2 border-t border-stone-200 space-y-1 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Produce Total:</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Direct Farmer Delivery:</span>
                <span className="text-emerald-700 font-semibold">FREE (Pilot Zone)</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-stone-900 pt-1">
                <span>{t.totalAmount}:</span>
                <span className="text-emerald-950 font-black">₹{total}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              className="w-full py-3 bg-[#1e3a24] hover:bg-emerald-950 text-amber-300 font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-98"
            >
              {paymentMethod === 'Cash on Delivery' ? 'Confirm Cash on Delivery' : t.placeOrder} (₹{total})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
