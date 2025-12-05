import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { HelpCircle, Check, X } from 'lucide-react';

export const EmojiMathGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [level, setLevel] = useState(1);
  const [problem, setProblem] = useState<any>(null);
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Solve the puzzle!");

  // Simple generator: A + B = C
  const EMOJIS = ['🍎', '🍌', '🍇', '🍕', '🍪', '🐱', '🐶', '⚽'];

  const generateProblem = () => {
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const val = Math.floor(Math.random() * 5) + 1 + level; // Value of the emoji
    const count = Math.floor(Math.random() * 2) + 2; // How many emojis (2 or 3)
    const total = val * count;
    
    // Generate options
    const correct = val;
    let wrong1 = val + Math.floor(Math.random() * 3) + 1;
    let wrong2 = Math.max(1, val - Math.floor(Math.random() * 3) - 1);
    
    // Shuffle options
    const opts = [correct, wrong1, wrong2].sort(() => Math.random() - 0.5);
    
    setProblem({ emoji, count, total, val });
    setOptions(opts);
    setMessage("What is the value of one " + emoji + "?");
  };

  useEffect(() => {
    generateProblem();
  }, [level]);

  const handleGuess = (guess: number) => {
    if (guess === problem.val) {
        setScore(s => s + 10);
        setMessage("Correct! 🎉");
        setTimeout(() => {
            setLevel(l => l + 1);
        }, 1000);
    } else {
        setMessage("Oops! Try again.");
    }
  };

  if (!problem) return null;

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-[2.5rem] shadow-2xl border-b-8 border-slate-100">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-800">Emoji Math</h2>
            <div className="flex items-center gap-3">
                 <div className="px-3 py-1 bg-purple-100 text-purple-700 font-bold rounded-lg">Lvl: {level}</div>
                 <Button size="sm" variant="outline" onClick={onExit}><X size={16}/></Button>
            </div>
        </div>

        <div className="text-center mb-10 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
            <div className="flex flex-wrap justify-center items-center gap-2 text-4xl md:text-5xl mb-4">
                {Array.from({ length: problem.count }).map((_, i) => (
                    <React.Fragment key={i}>
                        <span>{problem.emoji}</span>
                        {i < problem.count - 1 && <span className="text-slate-300">+</span>}
                    </React.Fragment>
                ))}
                <span className="text-slate-400 font-black">=</span>
                <span className="font-black text-slate-800">{problem.total}</span>
            </div>
            
            <div className="w-full h-1 bg-slate-200 my-6 rounded-full"></div>

            <div className="flex justify-center items-center gap-4 text-3xl font-bold text-slate-600">
                 {problem.emoji} <span className="text-slate-300">=</span> <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400"><HelpCircle size={24}/></div>
            </div>
        </div>

        <h3 className="text-center text-lg font-bold text-slate-500 mb-6">{message}</h3>

        <div className="grid grid-cols-3 gap-4">
            {options.map((opt, idx) => (
                <button
                    key={idx}
                    onClick={() => handleGuess(opt)}
                    className="aspect-square bg-white border-4 border-violet-100 hover:border-violet-500 hover:bg-violet-50 rounded-2xl text-3xl font-black text-slate-700 shadow-md transition-all active:scale-95 flex items-center justify-center"
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
  );
};