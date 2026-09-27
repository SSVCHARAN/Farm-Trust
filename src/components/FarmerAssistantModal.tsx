import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Volume2,
  Send,
  RotateCcw,
  IndianRupee,
  Clock,
  Package,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Farmer, Product, Order, FarmerAssistantAction } from '../types';
import { callFarmerAIAssistant } from '../services/aiService';
import { Language, translations } from '../data/translations';

interface FarmerAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmer: Farmer;
  products: Product[];
  orders: Order[];
  language: Language;
  onUpdateProductPrice: (productId: string, newPrice: number) => void;
  onOpenPendingOrders: () => void;
}

export const FarmerAssistantModal: React.FC<FarmerAssistantModalProps> = ({
  isOpen,
  onClose,
  farmer,
  products,
  orders,
  language,
  onUpdateProductPrice,
  onOpenPendingOrders,
}) => {
  const t = translations[language];

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<FarmerAssistantAction | null>(null);
  const [actionConfirmed, setActionConfirmed] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'te-IN' | 'en-IN'>(language === 'te' ? 'te-IN' : 'en-IN');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setInputQuery('');
      setLastAction(null);
      setActionConfirmed(false);
      setIsListening(false);
      setVoiceLang(language === 'te' ? 'te-IN' : 'en-IN');
    }
  }, [isOpen, language]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Browser speech recognition unavailable. Please use text input or presets.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = voiceLang;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const text = event.results[event.resultIndex][0].transcript;
        setInputQuery(text);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn(e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
  };

  const handleAsk = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    setIsProcessing(true);
    setActionConfirmed(false);
    setLastAction(null);

    try {
      const langParam = voiceLang.startsWith('te') ? 'te' : 'en';
      const result = await callFarmerAIAssistant(q, langParam, {
        farmer,
        products,
        orders,
      });

      setLastAction(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteAction = () => {
    if (!lastAction) return;

    if (lastAction.actionType === 'UPDATE_PRICE' && lastAction.payload) {
      const { productId, newPrice } = lastAction.payload;
      if (productId && newPrice) {
        onUpdateProductPrice(productId, newPrice);
        setActionConfirmed(true);
      }
    } else if (lastAction.actionType === 'VIEW_PENDING_ORDERS') {
      onOpenPendingOrders();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#1e3a24] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">{t.farmerAssistantTitle}</h2>
              <p className="text-xs text-emerald-200 font-medium">{t.farmerAssistantSub}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Quick Voice / Text Input Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-semibold text-stone-700">Voice or text command:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setVoiceLang('te-IN')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    voiceLang === 'te-IN' ? 'bg-[#1e3a24] text-amber-300' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  తెలుగు
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceLang('en-IN')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    voiceLang === 'en-IN' ? 'bg-[#1e3a24] text-amber-300' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-stone-50 border border-stone-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-emerald-700">
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-[#1e3a24] text-amber-300 hover:bg-emerald-950'
                }`}
                title="Tap to speak"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={t.assistantInputPlaceholder}
                className="flex-1 bg-transparent border-none text-xs sm:text-sm text-stone-900 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputQuery.trim()) {
                    handleAsk(inputQuery);
                  }
                }}
              />

              <button
                type="button"
                onClick={() => handleAsk(inputQuery)}
                disabled={!inputQuery.trim() || isProcessing}
                className="w-10 h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Clickable Demo Prompts */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-emerald-800" />
              <span>Tap a sample command to test:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setInputQuery(t.assistantSample1);
                  handleAsk(t.assistantSample1);
                }}
                className="p-2 text-left bg-stone-50 hover:bg-emerald-50 border border-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                <p className="font-bold text-emerald-950">📦 Show Pending Orders</p>
                <p className="text-stone-500 truncate">{t.assistantSample1}</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputQuery(t.assistantSample2);
                  handleAsk(t.assistantSample2);
                }}
                className="p-2 text-left bg-stone-50 hover:bg-emerald-50 border border-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                <p className="font-bold text-emerald-950">📦 ఆర్డర్లు చూపించు (Telugu)</p>
                <p className="text-stone-500 truncate">{t.assistantSample2}</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputQuery(t.assistantSample3);
                  handleAsk(t.assistantSample3);
                }}
                className="p-2 text-left bg-stone-50 hover:bg-emerald-50 border border-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                <p className="font-bold text-emerald-950">💰 Change Tomato Price</p>
                <p className="text-stone-500 truncate">{t.assistantSample3}</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputQuery(t.assistantSample4);
                  handleAsk(t.assistantSample4);
                }}
                className="p-2 text-left bg-stone-50 hover:bg-emerald-50 border border-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                <p className="font-bold text-emerald-950">💰 ధర మార్చండి (Telugu)</p>
                <p className="text-stone-500 truncate">{t.assistantSample4}</p>
              </button>
            </div>
          </div>

          {/* AI Thinking Indicator */}
          {isProcessing && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-center gap-2 text-xs text-emerald-950 font-bold animate-pulse">
              <Sparkles className="w-4 h-4 text-emerald-700 animate-spin" />
              <span>Analyzing farm marketplace data...</span>
            </div>
          )}

          {/* Assistant Action / Response Card */}
          {lastAction && (
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  AI
                </div>
                <div className="text-xs sm:text-sm text-stone-800 space-y-1">
                  <p className="font-semibold leading-relaxed">
                    {language === 'te' && lastAction.messageTelugu
                      ? lastAction.messageTelugu
                      : lastAction.message}
                  </p>
                </div>
              </div>

              {/* Action confirmation box if required */}
              {lastAction.confirmationRequired && !actionConfirmed && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Confirmation Required Before Updating Listing</span>
                  </div>

                  {lastAction.payload && (
                    <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-amber-200 font-medium">
                      <span>{lastAction.payload.productName}:</span>
                      <span>
                        <span className="line-through text-stone-400">₹{lastAction.payload.oldPrice}</span>
                        {' → '}
                        <strong className="text-emerald-950 font-extrabold text-sm">₹{lastAction.payload.newPrice}</strong> / {lastAction.payload.unit}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setLastAction(null)}
                      className="px-3 py-1.5 text-xs font-semibold text-stone-600 bg-white hover:bg-stone-100 rounded-lg border border-stone-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteAction}
                      className="px-4 py-1.5 text-xs font-extrabold bg-[#1e3a24] hover:bg-emerald-950 text-amber-300 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.confirmAction}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Success Card */}
              {actionConfirmed && (
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    {language === 'te'
                      ? 'ధర విజయవంతంగా మార్చబడింది! మార్కెట్లో లైవ్ చేయబడింది.'
                      : 'Done! The price was updated and is now live across the marketplace.'}
                  </span>
                </div>
              )}

              {/* View Orders Action Button */}
              {lastAction.actionType === 'VIEW_PENDING_ORDERS' && (
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenPendingOrders();
                      onClose();
                    }}
                    className="px-4 py-1.5 bg-[#1e3a24] text-amber-300 rounded-lg text-xs font-bold hover:bg-emerald-950 cursor-pointer"
                  >
                    Open Orders Tab →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
