import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { X, Hammer } from 'lucide-react';

export const MoleGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [moles, setMoles] = useState<boolean[]>(new Array(9).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const moleTimerRef = useRef<number | null>(null);

  const playSound = (type: 'hit' | 'pop') => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        if (type === 'hit') {
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
            osc.type = 'square';
        } else {
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
            osc.type = 'sine';
        }

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1);
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
        // Audio context might be blocked
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(30);
    setMoles(new Array(9).fill(false));

    // Game Loop
    timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 1) {
                endGame();
                return 0;
            }
            return prev - 1;
        });
    }, 1000);

    moleLoop();
  };

  const moleLoop = () => {
      if (!isPlaying && timeLeft <= 0) return;
      
      const randomTime = Math.random() * 800 + 400; // 400ms to 1200ms
      moleTimerRef.current = window.setTimeout(() => {
          const newMoles = new Array(9).fill(false);
          const randomIdx = Math.floor(Math.random() * 9);
          newMoles[randomIdx] = true;
          setMoles(newMoles);
          playSound('pop');
          
          if (timeLeft > 0) moleLoop();
      }, randomTime);
  };

  const endGame = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
    setMoles(new Array(9).fill(false));
  };

  useEffect(() => {
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
      };
  }, []);

  const whack = (idx: number) => {
      if (!moles[idx] || !isPlaying) return;
      playSound('hit');
      setScore(s => s + 1);
      const newMoles = [...moles];
      newMoles[idx] = false; // Hide immediately
      setMoles(newMoles);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-green-50 p-6 rounded-[3rem] shadow-2xl border-8 border-green-200 relative cursor-[url('https://cdn-icons-png.flaticon.com/32/7604/7604058.png'),_auto]">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-green-800 flex items-center gap-2">
                <Hammer className="w-6 h-6"/> Mole Boink!
            </h2>
            <Button size="sm" variant="danger" onClick={onExit}><X size={16}/></Button>
        </div>

        <div className="flex justify-between mb-8 px-4">
            <div className="bg-white px-4 py-2 rounded-xl font-black text-slate-700 shadow-md border-b-4 border-slate-200">
                Score: {score}
            </div>
            <div className="bg-white px-4 py-2 rounded-xl font-black text-red-500 shadow-md border-b-4 border-red-100">
                Time: {timeLeft}s
            </div>
        </div>

        {!isPlaying && timeLeft === 30 ? (
            <div className="text-center py-20">
                <div className="text-8xl mb-4 animate-bounce-slow">🐹</div>
                <Button onClick={startGame} size="lg" className="w-full text-xl shadow-green-300 bg-green-500 hover:bg-green-600">Start Game</Button>
            </div>
        ) : !isPlaying && timeLeft === 0 ? (
            <div className="text-center py-10 animate-pop">
                <h3 className="text-4xl font-black text-slate-800 mb-2">Time's Up!</h3>
                <p className="text-xl font-bold text-slate-500 mb-6">You boinked {score} moles!</p>
                <Button onClick={startGame} size="lg" className="w-full text-xl shadow-green-300 bg-green-500 hover:bg-green-600">Play Again</Button>
            </div>
        ) : (
            <div className="grid grid-cols-3 gap-4 mb-4">
                {moles.map((isActive, idx) => (
                    <div key={idx} className="aspect-square bg-green-800/20 rounded-full relative overflow-hidden border-b-4 border-white/50 shadow-inner">
                        <button
                            onClick={() => whack(idx)}
                            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-24 transition-transform duration-100 flex items-center justify-center text-6xl ${isActive ? 'translate-y-2' : 'translate-y-32'}`}
                        >
                            🐹
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};