import React from 'react';
import {
  Mic,
  Sprout,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  HeartHandshake
} from 'lucide-react';
import { Language, translations } from '../data/translations';

interface LandingHeroProps {
  language: Language;
  onExploreProducts: () => void;
  onFarmerStart: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  language,
  onExploreProducts,
  onFarmerStart,
}) => {
  const t = translations[language];

  return (
    <div className="bg-gradient-to-b from-[#1b3d27] via-[#244f34] to-[#faf8f5] text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Main Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {language === 'te'
                ? 'వాయిస్ ఆధారిత వ్యవసాయ విప్లవం'
                : 'Voice-First Agricultural Marketplace'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight sm:leading-tight">
            {language === 'te'
              ? 'స్వచ్ఛమైన ఆహారం. సరసమైన ధరలు. నేరుగా రైతుల నుండి.'
              : 'Pure Food. Fair Prices. Direct from Farmers.'}
          </h1>

          <p className="text-sm sm:text-lg text-emerald-100/90 font-medium max-w-2xl mx-auto leading-relaxed">
            {language === 'te'
              ? 'రైతులు నోటితో చెప్పి అమ్ముకోవచ్చు. కుటుంబాలు నోటితో చెప్పి కొనుగోలు చేయవచ్చు. AI ఇరువైపులా అనుసంధానిస్తుంది.'
              : 'Farmers can sell by speaking. Families can buy by speaking. AI helps both sides communicate, discover produce, and build trust.'}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onExploreProducts}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-stone-950" />
              <span>{t.exploreProducts}</span>
            </button>

            <button
              onClick={onFarmerStart}
              className="px-6 py-3 bg-white/15 hover:bg-white/25 text-white font-extrabold text-sm rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Mic className="w-4 h-4 text-amber-300" />
              <span>{t.iamFarmer} ({language === 'te' ? 'వాయిస్ ద్వారా చేర్చండి' : 'Add by Voice'})</span>
            </button>
          </div>
        </div>

        {/* 4 Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 text-white space-y-1.5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold mb-3 shadow-xs">
              <Mic className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold tracking-tight">VOICE IN YOUR LANGUAGE</h2>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              {language === 'te'
                ? 'టైప్ చేయనవసరం లేదు. తెలుగు లేదా ఇంగ్లీషులో మాట్లాడి పంటను సులభంగా అమ్మండి.'
                : 'Speak instead of typing. Native Telugu and English speech recognition with Gemini extraction.'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 text-white space-y-1.5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-400 text-stone-950 flex items-center justify-center font-bold mb-3 shadow-xs">
              <Sprout className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold tracking-tight">DIRECT FROM FARMERS</h2>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              {language === 'te'
                ? 'మధ్యవర్తులు లేరు. రైతుకు న్యాయమైన ధర, కుటుంబానికి తాజా పంట.'
                : 'Discover fresh harvests directly from verified local small-holder farmers.'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 text-white space-y-1.5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold mb-3 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold tracking-tight">TRUSTED MARKETPLACE</h2>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              {language === 'te'
                ? 'గుర్తింపు ధృవీకరణ మరియు ప్రజల నిజమైన రేటింగ్‌లతో పూర్తి విశ్వాసం.'
                : 'Identity checks, community ratings, and AI trust screening help families choose with confidence.'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 text-white space-y-1.5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-400 text-stone-950 flex items-center justify-center font-bold mb-3 shadow-xs">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold tracking-tight">SIMPLE 4-STEP LOOP</h2>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              {language === 'te'
                ? 'కనుగొనండి → పోల్చండి → ఆర్డర్ చేయండి → రేటింగ్ ఇవ్వండి.'
                : 'Find → Compare → Order → Receive → Rate. Transparent from seed to plate.'}
            </p>
          </div>
        </div>

        {/* 3-Minute Demo Guide Banner for Evaluators */}
        <div className="bg-stone-900/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-amber-400/40 text-xs sm:text-sm text-stone-300 shadow-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
            <span className="font-extrabold text-amber-300 text-sm sm:text-base">
              {language === 'te' ? '3 నిమిషాల సమగ్ర ప్రదర్శన గైడ్ (Competition Demo Loop):' : '3-Minute Competition Demo Walkthrough:'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1 text-stone-300">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
              <strong className="text-amber-300 block mb-1">1. Farmer Voice & AI Assistant</strong>
              <span>Open AI Assistant & ask "Show pending orders" or "Change tomato price". Add crop by Telugu voice and verify preview.</span>
            </div>
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
              <strong className="text-amber-300 block mb-1">2. Customer Voice Search & Trust</strong>
              <span>Switch to Customer. Speak "2 kg tomatoes under 40 rupees" in Telugu/English. Inspect Farmer Trust Passport and place order.</span>
            </div>
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
              <strong className="text-amber-300 block mb-1">3. Demand Insights & Rating Loop</strong>
              <span>Switch to Farmer: see order arrive & view Local Demand. Advance order. Switch back to Customer: complete & leave 5★ review!</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
