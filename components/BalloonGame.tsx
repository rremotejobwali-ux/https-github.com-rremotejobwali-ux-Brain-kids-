import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { Calculator, X } from 'lucide-react';

interface Balloon {
  id: number;
  x: number;
  y: number;
  value: number;
  speed: number;
  color: string;
}

const COLORS = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];

export const BalloonGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<{ text: string; answer: number }>({ text: '', answer: 0 });
  const [gameOver, setGameOver] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);

  const generateQuestion = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const isPlus = Math.random() > 0.5;
    
    if (isPlus) {
        setQuestion({ text: `${a} + ${b} = ?`, answer: a + b });
    } else {
        const max = Math.max(a, b);
        const min = Math.min(a, b);
        setQuestion({ text: `${max} - ${min} = ?`, answer: max - min });
    }
  };

  const spawnBalloon = () => {
    if (gameOver) return;
    
    const isCorrectAnswer = Math.random() > 0.6; // 40% chance to spawn the correct answer
    const value = isCorrectAnswer 
        ? question.answer 
        : Math.floor(Math.random() * 20); // Random distraction

    const newBalloon: Balloon = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10, // 10% to 90% width
      y: 100, // Start at bottom
      value,
      speed: Math.random() * 0.2 + 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
    
    setBalloons(prev => [...prev, newBalloon]);
  };

  useEffect(() => {
    generateQuestion();
    const spawnInterval = setInterval(spawnBalloon, 1500); // Spawn every 1.5s
    
    const animate = () => {
      setBalloons(prev => {
        const next = prev
            .map(b => ({ ...b, y: b.y - b.speed }))
            .filter(b => b.y > -20); // Remove if floats off top
        return next;
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
        clearInterval(spawnInterval);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [question, gameOver]);

  const popBalloon = (id: number, val: number) => {
    if (gameOver) return;
    
    if (val === question.answer) {
        // Correct!
        setScore(s => s + 10);
        setBalloons([]); // Clear screen for next round
        generateQuestion();
    } else {
        // Wrong!
        setScore(s => Math.max(0, s - 5));
        setBalloons(prev => prev.filter(b => b.id !== id));
    }
  };

  return (
    <div className="w-full h-[80vh] flex flex-col relative overflow-hidden bg-sky-100 rounded-3xl shadow-inner border-4 border-sky-200">
        
        {/* HUD */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-lg border-2 border-sky-300">
                <span className="text-2xl font-black text-sky-600">Score: {score}</span>
            </div>
            <div className="bg-yellow-400 px-8 py-3 rounded-2xl shadow-[0_10px_20px_rgba(250,204,21,0.4)] transform rotate-2 animate-float">
                <span className="text-4xl font-black text-slate-900">{question.text}</span>
            </div>
            <div className="pointer-events-auto">
                <Button variant="danger" size="sm" onClick={onExit}><X className="w-4 h-4" /></Button>
            </div>
        </div>

        {/* Game Area */}
        <div ref={containerRef} className="flex-1 relative">
            {balloons.map(b => (
                <button
                    key={b.id}
                    onClick={() => popBalloon(b.id, b.value)}
                    style={{ left: `${b.x}%`, top: `${b.y}%` }}
                    className={`absolute w-20 h-24 rounded-full ${b.color} shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer active:scale-95 transition-transform hover:brightness-110 before:content-[''] before:absolute before:bottom-[-10px] before:w-1 before:h-10 before:bg-slate-400/50`}
                >
                    <span className="text-2xl font-black text-white drop-shadow-md">{b.value}</span>
                    <div className="absolute top-4 right-4 w-4 h-8 bg-white/30 rounded-full rotate-45"></div>
                </button>
            ))}
        </div>
        
        <div className="absolute bottom-2 w-full text-center text-sky-300 font-bold uppercase tracking-widest text-sm pointer-events-none">
            Pop the Correct Answer!
        </div>
    </div>
  );
};