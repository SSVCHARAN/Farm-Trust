import React from 'react';
import { Sprout, Globe, UserCheck, ShoppingBag, RotateCcw } from 'lucide-react';
import { UserRole } from '../types';
import { Language, translations } from '../data/translations';

interface HeaderProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeOrdersCount: number;
  farmerPendingOrdersCount: number;
  onOpenOrders: () => void;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  setRole,
  language,
  setLanguage,
  activeOrdersCount,
  farmerPendingOrdersCount,
  onOpenOrders,
  onResetDemo,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      {/* Top Demo Bar / Quick Role Switcher */}
      <div className="bg-[#1b3d27] text-white px-3 sm:px-6 py-1.5 text-xs sm:text-sm font-medium flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-emerald-100 font-medium">Demo Mode:</span>
          <div className="inline-flex rounded-md p-0.5 bg-white/10">
            <button
              onClick={() => setRole('FARMER')}
              className={`px-2.5 py-1 rounded text-xs transition-all font-semibold ${
                role === 'FARMER'
                  ? 'bg-amber-400 text-stone-900 shadow-xs'
                  : 'text-stone-200 hover:text-white'
              }`}
            >
              🧑‍🌾 {language === 'te' ? 'రైతు (రవి కుమార్)' : 'Farmer (Ravi Kumar)'}
              {farmerPendingOrdersCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px]">
                  {farmerPendingOrdersCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setRole('CUSTOMER')}
              className={`px-2.5 py-1 rounded text-xs transition-all font-semibold ${
                role === 'CUSTOMER'
                  ? 'bg-amber-400 text-stone-900 shadow-xs'
                  : 'text-stone-200 hover:text-white'
              }`}
            >
              🛒 {language === 'te' ? 'కస్టమర్ (అనన్య)' : 'Customer (Ananya)'}
              {activeOrdersCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-emerald-400 text-stone-900 rounded-full text-[10px] font-bold">
                  {activeOrdersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-white/10 rounded-md p-0.5">
            <Globe className="w-3.5 h-3.5 text-emerald-300 ml-1.5" />
            <button
              onClick={() => setLanguage('te')}
              className={`px-2 py-0.5 text-xs rounded transition-all ${
                language === 'te'
                  ? 'bg-white text-stone-900 font-bold'
                  : 'text-stone-200 hover:text-white'
              }`}
            >
              తెలుగు
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 text-xs rounded transition-all ${
                language === 'en'
                  ? 'bg-white text-stone-900 font-bold'
                  : 'text-stone-200 hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          <button
            onClick={onResetDemo}
            title="Reset to initial seed data"
            className="flex items-center gap-1 text-[11px] text-emerald-200/80 hover:text-white hover:underline transition-colors px-1.5 py-0.5 rounded cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">{t.resetDemo}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-green-950 flex items-center justify-center text-amber-300 shadow-sm border border-emerald-700/30">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-emerald-950">
                {t.appName}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 hidden sm:inline-block">
                {language === 'te' ? 'ప్రత్యక్ష రైతు అంగడి' : 'Direct Farm Direct'}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Right Action Area */}
        <div className="flex items-center gap-2 sm:gap-4">
          {role === 'CUSTOMER' && (
            <button
              onClick={onOpenOrders}
              className="relative flex items-center gap-2 px-3 py-2 text-sm font-semibold text-stone-700 hover:text-emerald-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-800" />
              <span>{t.myOrders}</span>
              {activeOrdersCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-emerald-700 rounded-full">
                  {activeOrdersCount}
                </span>
              )}
            </button>
          )}

          {role === 'FARMER' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-lg text-xs font-medium text-amber-900">
              <UserCheck className="w-4 h-4 text-amber-700" />
              <span>
                {language === 'te' ? 'రవి కుమార్ (ఆనందపురం)' : 'Ravi Kumar (Anandapuram)'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
