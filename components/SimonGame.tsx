import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Play, X } from 'lucide-react';

const COLORS = [
  { id: 0, color: 'bg-green-500', active: 'bg-green-300', sound: 261.63 }, // C4
  { id: 1, color: 'bg-red-500', active: 'bg-red-300', sound: 329.63 },   // E4
  { id: 2, color: 'bg-yellow-400', active: 'bg-yellow-200', sound: 392.00 }, // G4
  { id: 3, color: 'bg-blue-500', active: 'bg-blue-300', sound: 523.25 }    // C5
];

export const SimonGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [litButton, setLitButton] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Press Play to Start!");

  const playSound = (freq: number) => {
    // Basic Audio Context beep
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = freq;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
            osc.stop(ctx.currentTime + 0.5);
        }
    } catch (e) {
        console.error(e);
    }
  };

  const flashButton = async (id: number) => {
    setLitButton(id);
    playSound(COLORS[id].sound);
    await new Promise(r => setTimeout(r, 400));
    setLitButton(null);
  };

  const playSequence = async (seq: number[]) => {
    setIsUserTurn(false);
    setMessage("Watch carefully...");
    await new Promise(r => setTimeout(r, 800));
    
    for (const id of seq) {
        await flashButton(id);
        await new Promise(r => setTimeout(r, 300));
    }
    
    setIsUserTurn(true);
    setMessage("Your turn!");
  };

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    const firstColor = Math.floor(Math.random() * 4);
    const newSeq = [firstColor];
    setSequence(newSeq);
    setUserSequence([]);
    playSequence(newSeq);
  };

  const handleColorClick = async (id: number) => {
    if (!isUserTurn) return;
    
    flashButton(id);
    const newUserSeq = [...userSequence, id];
    setUserSequence(newUserSeq);

    // Check correctness
    const currentIndex = newUserSeq.length - 1;
    if (newUserSeq[currentIndex] !== sequence[currentIndex]) {
        setMessage(`Game Over! Score: ${score}`);
        setIsPlaying(false);
        setIsUserTurn(false);
        playSound(150); // Low error sound
        return;
    }

    if (newUserSeq.length === sequence.length) {
        setScore(s => s + 1);
        setMessage("Good job! Next round...");
        setIsUserTurn(false);
        setUserSequence([]);
        await new Promise(r => setTimeout(r, 1000));
        
        const nextColor = Math.floor(Math.random() * 4);
        const nextSeq = [...sequence, nextColor];
        setSequence(nextSeq);
        playSequence(nextSeq);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="text-xl font-black text-slate-800">Simon Says</h2>
            <div className="flex gap-4 items-center">
                 <div className="font-bold text-slate-500">Score: {score}</div>
                 <Button size="sm" variant="danger" onClick={onExit}><X size={16}/></Button>
            </div>
        </div>

        <div className="mb-8 text-2xl font-black text-violet-600 animate-pulse">{message}</div>

        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-slate-800 p-4 shadow-2xl">
            <div className="w-full h-full relative rounded-full overflow-hidden">
                {/* Top Left */}
                <button 
                    className={`absolute top-0 left-0 w-1/2 h-1/2 bg-green-500 border-r-4 border-b-4 border-slate-800 hover:bg-green-400 active:bg-green-200 transition-colors ${litButton === 0 ? 'bg-green-200 brightness-150' : ''}`}
                    onClick={() => handleColorClick(0)}
                ></button>
                {/* Top Right */}
                <button 
                    className={`absolute top-0 right-0 w-1/2 h-1/2 bg-red-500 border-l-4 border-b-4 border-slate-800 hover:bg-red-400 active:bg-red-200 transition-colors ${litButton === 1 ? 'bg-red-200 brightness-150' : ''}`}
                    onClick={() => handleColorClick(1)}
                ></button>
                {/* Bottom Left */}
                <button 
                    className={`absolute bottom-0 left-0 w-1/2 h-1/2 bg-yellow-400 border-r-4 border-t-4 border-slate-800 hover:bg-yellow-300 active:bg-yellow-100 transition-colors ${litButton === 2 ? 'bg-yellow-100 brightness-150' : ''}`}
                    onClick={() => handleColorClick(2)}
                ></button>
                {/* Bottom Right */}
                <button 
                    className={`absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-500 border-l-4 border-t-4 border-slate-800 hover:bg-blue-400 active:bg-blue-200 transition-colors ${litButton === 3 ? 'bg-blue-200 brightness-150' : ''}`}
                    onClick={() => handleColorClick(3)}
                ></button>

                {/* Center Start Button */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center p-2">
                    {!isPlaying && (
                        <button onClick={startGame} className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center text-slate-800 font-black text-xs hover:scale-105 transition-transform">
                            <Play size={20} className="mb-1 fill-current"/> START
                        </button>
                    )}
                    {isPlaying && (
                        <div className="text-white font-mono text-2xl">{score}</div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};