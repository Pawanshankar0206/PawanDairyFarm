import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Heart, Award } from 'lucide-react';

interface MotivationalBannerProps {
  category?: 'all' | 'growth' | 'animal' | 'financial' | 'buffalo' | 'calf';
  compact?: boolean;
}

const QUOTES = {
  all: [
    { text: "Great farms are built one consistent day at a time.", category: "Business Growth", icon: TrendingUp },
    { text: "Every litre tells a story of dedication.", category: "Excellence", icon: Sparkles },
    { text: "Healthy animals build a healthy business.", category: "Animal Care", icon: Heart },
    { text: "Every rupee matters. Every decision counts.", category: "Financial Wisdom", icon: Award },
    { text: "Track your progress. Build your legacy.", category: "Legacy", icon: TrendingUp },
    { text: "Better care today. Better production tomorrow.", category: "Livestock", icon: Heart },
    { text: "Smart management turns hard work into sustainable growth.", category: "Leadership", icon: TrendingUp },
    { text: "A strong farm begins with healthy livestock.", category: "Animal Care", icon: Heart },
    { text: "Know your numbers. Grow your business.", category: "Finance", icon: Award }
  ],
  buffalo: [
    { text: "High-yield buffalo breeding requires unwavering precision and timely care.", category: "Buffalo Care", icon: Heart },
    { text: "Track every insemination. Protect every pregnancy. Guarantee farm continuity.", category: "Breeding", icon: Sparkles },
    { text: "Optimal nutrition and timely deworming maximize buffalo lactation longevity.", category: "Nutrition", icon: TrendingUp }
  ],
  calf: [
    { text: "Today's well-nourished calf is tomorrow's 20-litre champion milker.", category: "Future Herd", icon: TrendingUp },
    { text: "Consistent colostrum, clean water, and regular weight monitoring build generational vigor.", category: "Growth", icon: Heart },
    { text: "Every gram of daily calf weight gain compounds into enterprise equity.", category: "Performance", icon: Award }
  ],
  growth: [
    { text: "Great farms are built one consistent day at a time.", category: "Business Growth", icon: TrendingUp },
    { text: "Small investments today create stronger farms tomorrow.", category: "Vision", icon: TrendingUp },
    { text: "Success is not measured in litres alone, but in the value you create.", category: "Value", icon: Sparkles }
  ],
  animal: [
    { text: "Healthy animals build a healthy business.", category: "Health", icon: Heart },
    { text: "Better care today. Better production tomorrow.", category: "Care", icon: Heart },
    { text: "Every animal deserves attention, care, and consistency.", category: "Compassion", icon: Heart }
  ],
  financial: [
    { text: "Every rupee matters. Every decision counts.", category: "Finance", icon: Award },
    { text: "Know your numbers. Grow your business.", category: "Growth", icon: TrendingUp },
    { text: "Measure your progress. Improve your performance.", category: "Analytics", icon: Award }
  ]
};

export const MotivationalBanner: React.FC<MotivationalBannerProps> = ({ category = 'all', compact = false }) => {
  const quoteList = QUOTES[category] || QUOTES.all;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (quoteList.length <= 1) return;
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % quoteList.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [quoteList]);

  const current = quoteList[index];
  const Icon = current.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-400/90 font-medium tracking-wide py-1 px-2.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 backdrop-blur-sm animate-fade-in">
        <Icon className="w-3.5 h-3.5 text-gold-400 shrink-0" />
        <span className="italic">"{current.text}"</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-950/70 via-slate-900/80 to-charcoal-900/90 border border-emerald-500/20 p-3.5 shadow-lg backdrop-blur-md transition-all duration-700">
      <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-900/60 border border-emerald-500/30 text-gold-400 shadow-inner">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-gold-400/80">
              {current.category}
            </div>
            <p className="text-sm font-medium text-slate-200 italic tracking-wide">
              "{current.text}"
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          {quoteList.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-5 bg-gold-400' : 'w-1.5 bg-slate-700 hover:bg-slate-600'
              }`}
              title={`Quote ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
