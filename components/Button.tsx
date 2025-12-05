
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  noSound?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  noSound = false,
  onClick,
  ...props 
}) => {
  const baseStyles = "font-bold rounded-xl transition-all duration-200 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30",
    secondary: "bg-yellow-400 hover:bg-yellow-500 text-slate-900 shadow-yellow-400/30",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30",
    success: "bg-green-500 hover:bg-green-600 text-white shadow-green-500/30",
    outline: "bg-transparent border-2 border-slate-300 hover:border-blue-500 hover:text-blue-500 text-slate-500"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const playClickSound = () => {
    if (noSound) return;
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } catch(e) { /* ignore */ }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      playClickSound();
      if (onClick) onClick(e);
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};
