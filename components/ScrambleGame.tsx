import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Shuffle, X, Check, HelpCircle } from 'lucide-react';

const WORDS = [
  { word: "APPLE", hint: "A red or green fruit." },
  { word: "SCHOOL", hint: "Where you go to learn." },
  { word: "TIGER", hint: "A big striped cat." },
  { word: "PLANET", hint: "Earth is one of these." },
  { word: "HAPPY", hint: "The opposite of sad." },
  { word: "ROBOT", hint: "A machine that acts like a human." },
  { word: "SUMMER", hint: "The hottest season." },
  { word: "FRIEND", hint: "Someone you like to play with." },
  { word: "WATER", hint: "You drink this when thirsty." },
  { word: "HOUSE", hint: "A place where people live." }
];

export const ScrambleGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"none" | "correct" | "wrong">("none");

  const shuffleWord = (word: string) => {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  };

  useEffect(() => {
    setScrambled(shuffleWord(WORDS[currentIdx].word));
    setInput("");
    setFeedback("none");
  }, [currentIdx]);

  const checkAnswer = () => {
    if (input.toUpperCase() === WORDS[currentIdx].word) {
        setFeedback("correct");
        setScore(s => s + 10);
        setTimeout(() => {
            setCurrentIdx(prev => (prev + 1) % WORDS.length);
        }, 1500);
    } else {
        setFeedback("wrong");
        setTimeout(() => setFeedback("none"), 1000);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white p-8 rounded-[2.5rem] shadow-2xl border-b-8 border-slate-100">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Shuffle className="text-violet-500" /> Word Scramble
            </h2>
            <div className="flex items-center gap-3">
                 <div className="px-3 py-1 bg-yellow-100 text-yellow-700 font-bold rounded-lg">Score: {score}</div>
                 <Button size="sm" variant="outline" onClick={onExit}><X size={16}/></Button>
            </div>
        </div>

        <div className="text-center mb-10">
            <div className="text-6xl font-black text-violet-600 tracking-[0.5em] mb-4 font-mono uppercase drop-shadow-sm">
                {scrambled}
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-slate-500 text-sm font-bold">
                <HelpCircle size={16} /> Hint: {WORDS[currentIdx].hint}
            </div>
        </div>

        <div className="relative mb-6">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                className={`w-full text-center text-4xl font-black p-4 rounded-2xl border-4 outline-none transition-all uppercase tracking-widest ${
                    feedback === 'correct' ? 'border-green-400 bg-green-50 text-green-600' :
                    feedback === 'wrong' ? 'border-red-400 bg-red-50 text-red-600' :
                    'border-slate-200 focus:border-violet-500 focus:bg-violet-50 text-slate-800'
                }`}
                placeholder="TYPE HERE"
                autoFocus
            />
            {feedback === 'correct' && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-pop">
                    <Check size={32} strokeWidth={4} />
                </div>
            )}
        </div>

        <Button 
            onClick={checkAnswer} 
            size="lg" 
            className="w-full bg-violet-600 hover:bg-violet-700 shadow-violet-300"
            disabled={feedback === 'correct'}
        >
            Check Spelling
        </Button>
    </div>
  );
};