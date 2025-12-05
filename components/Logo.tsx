import React from 'react';
import { Sparkles, GraduationCap, Brain } from 'lucide-react';

export const Logo: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => {
  const isLarge = size === 'lg';

  return (
    <div className={`flex items-center gap-3 select-none ${isLarge ? 'flex-col' : 'flex-row'}`}>
      <div className={`relative flex items-center justify-center ${isLarge ? 'w-24 h-24' : 'w-12 h-12'}`}>
        {/* Background Blob */}
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-pink-500 to-violet-600 rounded-2xl rotate-6 shadow-lg animate-pulse"></div>
        
        {/* Icon */}
        <div className={`absolute inset-0.5 bg-white rounded-2xl flex items-center justify-center z-10 ${isLarge ? 'border-4' : 'border-2'} border-transparent bg-clip-padding`}>
             <Brain className={`${isLarge ? 'w-12 h-12' : 'w-6 h-6'} text-pink-500`} />
        </div>
        
        {/* Floating Cap */}
        <div className="absolute -top-2 -right-2 z-20 animate-bounce-slow">
            <GraduationCap className={`${isLarge ? 'w-10 h-10' : 'w-5 h-5'} text-violet-700 fill-violet-700 drop-shadow-md`} />
        </div>
      </div>

      <div className={`${isLarge ? 'text-center' : 'text-left'}`}>
        <div className={`${isLarge ? 'text-sm mb-1' : 'text-[10px]'} font-bold text-white uppercase tracking-widest flex items-center justify-center gap-1 opacity-90`}>
             <Sparkles size={isLarge ? 14 : 10} className="text-yellow-300" /> 
             Rafia Rukshar
             <Sparkles size={isLarge ? 14 : 10} className="text-yellow-300" />
        </div>
        <h1 className={`${isLarge ? 'text-5xl' : 'text-2xl'} font-black text-white drop-shadow-md leading-none tracking-tight`}>
          Brain<span className="text-yellow-300">Kids</span>
        </h1>
      </div>
    </div>
  );
};