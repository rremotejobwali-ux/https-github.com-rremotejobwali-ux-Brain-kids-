import React, { useState, useEffect, useRef } from 'react';
import { Subject, TypingChallenge } from '../types';
import { generateTypingContent } from '../services/geminiService';
import { Button } from './Button';
import { Loader } from './Loader';
import { Keyboard, RefreshCw, CheckCircle2, Timer, Gauge } from 'lucide-react';

interface TypingGameProps {
  subject: Subject;
  grade: number;
  onComplete: (score: number, accuracy: number, wpm: number) => void;
  onExit: () => void;
}

export const TypingGame: React.FC<TypingGameProps> = ({ subject, grade, onComplete, onExit }) => {
  const [challenge, setChallenge] = useState<TypingChallenge | null>(null);
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);

  const loadContent = async () => {
    setLoading(true);
    setCompleted(false);
    setInput('');
    setStartTime(null);
    setElapsedTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
    
    const data = await generateTypingContent(subject, grade);
    setChallenge(data);
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    loadContent();
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [subject, grade]);

  const startTimer = () => {
    if (!startTime) {
        setStartTime(Date.now());
        timerRef.current = window.setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
    }
  };

  const calculateStats = () => {
    if (!challenge) return { wpm: 0, accuracy: 0 };
    
    // If started but not finished, calculate live stats
    const timeInMinutes = (elapsedTime || 1) / 60;
    const words = input.trim().split(/\s+/).length;
    const wpm = Math.floor(words / timeInMinutes) || 0;

    let correctChars = 0;
    const targetText = challenge.text;
    for (let i = 0; i < input.length; i++) {
      if (i < targetText.length && input[i] === targetText[i]) {
        correctChars++;
      }
    }
    const accuracy = targetText.length > 0 ? Math.round((correctChars / targetText.length) * 100) : 100;

    return { wpm, accuracy };
  };

  const currentStats = calculateStats();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    startTimer();
    setInput(val);

    if (challenge && val.length >= challenge.text.length) {
      setCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFinish = () => {
    onComplete(currentStats.accuracy, currentStats.accuracy, currentStats.wpm);
  };

  if (loading) return <Loader message={`Writing a fun story about ${subject}...`} />;

  if (!challenge) return null;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-xl text-blue-700 font-bold">
                <Timer className="w-5 h-5"/>
                <span className="font-mono text-xl">{elapsedTime}s</span>
             </div>
             <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-xl text-green-700 font-bold">
                <Gauge className="w-5 h-5"/>
                <span className="font-mono text-xl">{currentStats.wpm} WPM</span>
             </div>
        </div>
        <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={loadContent} className="rounded-xl"><RefreshCw className="w-4 h-4 mr-2"/> New</Button>
            <Button size="sm" variant="danger" onClick={onExit} className="rounded-xl">Exit</Button>
        </div>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border-b-8 border-slate-200 relative overflow-hidden">
        {/* The Text to Type */}
        <div className="mb-8 text-2xl leading-relaxed font-bold font-mono text-slate-300 select-none">
            {challenge.text.split('').map((char, index) => {
                let colorClass = "";
                let bgClass = "";
                
                if (index < input.length) {
                    if (input[index] === char) {
                        colorClass = "text-green-500";
                    } else {
                        colorClass = "text-red-500";
                        bgClass = "bg-red-100 rounded";
                    }
                }
                return <span key={index} className={`${colorClass} ${bgClass} transition-colors duration-100`}>{char}</span>;
            })}
        </div>

        {/* Input Area */}
        <div className="relative">
            <textarea
                ref={inputRef}
                value={input}
                onChange={handleChange}
                disabled={completed}
                className="w-full h-40 p-6 text-2xl font-mono border-4 border-dashed border-slate-300 rounded-3xl focus:border-blue-500 focus:bg-blue-50 outline-none transition-all resize-none text-slate-800 placeholder-slate-300"
                placeholder="Start typing here... the timer starts when you type!"
                autoFocus
                spellCheck={false}
            />
            {completed && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl animate-fade-in z-10">
                    <CheckCircle2 className="w-20 h-20 text-green-500 animate-pop" />
                </div>
            )}
        </div>
      </div>

      {completed ? (
         <div className="mt-8 flex justify-center animate-pop">
             <Button size="lg" variant="success" onClick={handleFinish} className="text-xl px-12 py-4 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.6)] border-4 border-white">
                Finish Lesson! 🎉
             </Button>
         </div>
      ) : (
        <div className="text-center mt-6">
            {!startTime && <p className="text-slate-400 font-bold animate-pulse">Start typing to begin the timer!</p>}
        </div>
      )}
    </div>
  );
};