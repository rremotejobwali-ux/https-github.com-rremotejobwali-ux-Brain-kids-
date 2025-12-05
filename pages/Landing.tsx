
import React, { useEffect, useRef } from 'react';
import { Logo } from '../components/Logo';
import { Gamepad2, Brain, GraduationCap, Monitor, Sparkles, BookOpen, Music, Palette } from 'lucide-react';

export const Landing: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const hasWelcomed = useRef(false);

  useEffect(() => {
    const welcome = () => {
      if (hasWelcomed.current) return;
      
      // Cancel any existing speech
      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance("Welcome to Brain Kids, designed by Rafia and Rukshar!");
      u.rate = 0.9;
      u.pitch = 1.1;
      u.lang = 'en-US';
      u.volume = 1;

      // Try to speak
      window.speechSynthesis.speak(u);
      hasWelcomed.current = true;
    };

    // Attempt to welcome immediately (might be blocked by browser autoplay policy)
    welcome();

    // Also attach to first click just in case autoplay was blocked
    const clickHandler = () => {
        welcome();
        window.removeEventListener('click', clickHandler);
    };
    window.addEventListener('click', clickHandler);

    return () => {
        window.speechSynthesis.cancel();
        window.removeEventListener('click', clickHandler);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-fredoka">
      
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
        
        <div className="mb-8 animate-float">
             <Logo size="lg" />
        </div>

        <p className="text-2xl md:text-3xl text-white mb-12 max-w-2xl font-bold leading-relaxed drop-shadow-md">
           The most fun way to learn <span className="text-yellow-300">English</span>, <span className="text-pink-300">Math</span>, <span className="text-cyan-300">AI</span> & <span className="text-green-300">Art</span>!
        </p>
        
        <button 
            onClick={onStart} 
            className="group relative text-3xl px-16 py-8 rounded-[3rem] bg-white text-violet-600 font-black shadow-[0_10px_40px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-200 border-4 border-white/50"
        >
            <span className="relative z-10 flex items-center gap-3">Play & Learn! 🚀</span>
            <div className="absolute inset-0 rounded-[3rem] bg-white opacity-0 group-hover:opacity-100 blur-lg transition-opacity"></div>
        </button>
      </div>

      {/* Features Grid */}
      <div className="py-12 px-6 max-w-7xl mx-auto w-full z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
                { icon: Brain, title: "AI Tutor", desc: "Learn Smart", color: "text-purple-600", bg: "bg-purple-100" },
                { icon: Palette, title: "Paint Studio", desc: "Draw & Color", color: "text-pink-600", bg: "bg-pink-100" },
                { icon: Music, title: "Music", desc: "Play Piano", color: "text-blue-600", bg: "bg-blue-100" },
                { icon: Gamepad2, title: "Fun Arcade", desc: "Cool Games", color: "text-green-600", bg: "bg-green-100" }
            ].map((feature, idx) => (
                <div key={idx} className="glass-card p-6 text-center hover:-translate-y-2 transition-transform duration-300 border-none bg-white/80">
                    <div className={`w-16 h-16 mx-auto mb-4 ${feature.bg} rounded-2xl flex items-center justify-center shadow-inner`}>
                        <feature.icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">{feature.title}</h3>
                    <p className="text-slate-500 font-bold text-sm leading-snug">{feature.desc}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
