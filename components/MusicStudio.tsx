import React, { useState } from 'react';
import { Button } from './Button';
import { X, Music } from 'lucide-react';

const NOTES = [
  { note: 'C', color: 'bg-red-500', freq: 261.63 },
  { note: 'D', color: 'bg-orange-500', freq: 293.66 },
  { note: 'E', color: 'bg-yellow-400', freq: 329.63 },
  { note: 'F', color: 'bg-green-500', freq: 349.23 },
  { note: 'G', color: 'bg-cyan-500', freq: 392.00 },
  { note: 'A', color: 'bg-blue-500', freq: 440.00 },
  { note: 'B', color: 'bg-violet-500', freq: 493.88 },
  { note: 'C2', color: 'bg-pink-500', freq: 523.25 },
];

export const MusicStudio: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [activeNote, setActiveNote] = useState<string | null>(null);

  const playNote = (noteObj: typeof NOTES[0]) => {
    setActiveNote(noteObj.note);
    
    // Play Sound
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = noteObj.freq;
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1);
        osc.stop(ctx.currentTime + 1);
    } catch (e) {
        console.error(e);
    }

    setTimeout(() => setActiveNote(null), 200);
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-card p-8 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <span className="p-3 bg-pink-500 rounded-full text-white"><Music /></span>
            Music Studio
        </h2>
        <Button variant="danger" onClick={onExit}><X /></Button>
      </div>

      <div className="flex justify-center items-end gap-2 md:gap-4 h-64 md:h-80 bg-slate-900/5 p-8 rounded-[3rem] border-4 border-white/50">
        {NOTES.map((n) => (
            <button
                key={n.note}
                onClick={() => playNote(n)}
                className={`
                    relative flex-1 rounded-b-3xl rounded-t-lg transition-all duration-100 border-b-8 border-black/20
                    ${n.color}
                    ${activeNote === n.note ? 'h-[90%] translate-y-2 brightness-125 shadow-[0_0_30px_rgba(255,255,255,0.8)]' : 'h-full hover:h-[98%] shadow-lg'}
                `}
            >
                <div className="absolute bottom-8 w-full text-center text-white font-black text-xl md:text-3xl drop-shadow-md">
                    {n.note.replace('2', '')}
                </div>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/30 rounded-full"></div>
            </button>
        ))}
      </div>

      <div className="mt-8 text-center text-slate-600 font-bold bg-white/50 p-4 rounded-xl">
        Tap a colorful key to play a song! 🎵
      </div>
    </div>
  );
};