import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Volume2, ArrowRight, Check, X, Star } from 'lucide-react';

interface LearnItem {
  id: string;
  letter: string;
  word: string;
  emoji: string;
  color: string;
}

const ITEMS: LearnItem[] = [
  { id: '1', letter: 'A', word: 'Apple', emoji: '🍎', color: 'bg-red-100 text-red-600' },
  { id: '2', letter: 'B', word: 'Ball', emoji: '⚽', color: 'bg-blue-100 text-blue-600' },
  { id: '3', letter: 'C', word: 'Cat', emoji: '🐱', color: 'bg-orange-100 text-orange-600' },
  { id: '4', letter: 'D', word: 'Dog', emoji: '🐶', color: 'bg-amber-100 text-amber-600' },
  { id: '5', letter: 'E', word: 'Elephant', emoji: '🐘', color: 'bg-gray-100 text-gray-600' },
  { id: '6', letter: 'F', word: 'Fish', emoji: '🐠', color: 'bg-cyan-100 text-cyan-600' },
  { id: '7', letter: 'G', word: 'Grapes', emoji: '🍇', color: 'bg-purple-100 text-purple-600' },
  { id: '8', letter: 'H', word: 'House', emoji: '🏠', color: 'bg-yellow-100 text-yellow-600' },
];

export const EnglishLearningGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<LearnItem[]>([]);
  const [quizQuestion, setQuizQuestion] = useState<LearnItem | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (mode === 'quiz') {
      setupQuiz();
    }
  }, [mode]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
  };

  const handleLearnNext = () => {
    const nextIdx = (currentIndex + 1) % ITEMS.length;
    setCurrentIndex(nextIdx);
    const item = ITEMS[nextIdx];
    speak(`${item.letter} is for ${item.word}`);
  };

  const handleLearnPrev = () => {
    const nextIdx = (currentIndex - 1 + ITEMS.length) % ITEMS.length;
    setCurrentIndex(nextIdx);
    const item = ITEMS[nextIdx];
    speak(`${item.letter} is for ${item.word}`);
  };

  const playCurrentSound = () => {
    const item = ITEMS[currentIndex];
    speak(`${item.letter} is for ${item.word}`);
  };

  const setupQuiz = () => {
    const question = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    setQuizQuestion(question);
    
    // Generate distractors
    const distractors = ITEMS.filter(i => i.id !== question.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
    
    const opts = [question, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(opts);
    
    setMessage(`Where is the ${question.word}?`);
    speak(`Can you find the ${question.word}?`);
  };

  const handleQuizAnswer = (item: LearnItem) => {
    if (quizQuestion && item.id === quizQuestion.id) {
        setScore(s => s + 1);
        setMessage("Correct! Good Job!");
        speak("Yay! Good Job!");
        setTimeout(setupQuiz, 1500);
    } else {
        setMessage("Oops, try again!");
        speak("Oops, try again!");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-[2.5rem] shadow-2xl border-b-8 border-slate-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span className="text-3xl">🗣️</span> English Teacher
            </h2>
            <div className="flex gap-2">
                <Button 
                    size="sm" 
                    variant={mode === 'learn' ? 'primary' : 'outline'} 
                    onClick={() => setMode('learn')}
                    className="rounded-full"
                >
                    Learn
                </Button>
                <Button 
                    size="sm" 
                    variant={mode === 'quiz' ? 'secondary' : 'outline'} 
                    onClick={() => setMode('quiz')}
                    className="rounded-full"
                >
                    Quiz
                </Button>
                <Button size="sm" variant="danger" onClick={onExit} className="rounded-full ml-2"><X size={16}/></Button>
            </div>
        </div>

        {/* Content */}
        {mode === 'learn' ? (
            <div className="text-center">
                <div className={`aspect-square max-w-xs mx-auto ${ITEMS[currentIndex].color} rounded-[3rem] flex flex-col items-center justify-center mb-8 border-4 border-white shadow-xl transition-all duration-500`}>
                    <div className="text-9xl mb-4 filter drop-shadow-md animate-float">{ITEMS[currentIndex].emoji}</div>
                    <div className="text-8xl font-black opacity-20">{ITEMS[currentIndex].letter}</div>
                </div>
                
                <h3 className="text-6xl font-black text-slate-800 mb-2">{ITEMS[currentIndex].letter}</h3>
                <p className="text-4xl font-bold text-slate-500 mb-8">{ITEMS[currentIndex].word}</p>

                <div className="flex justify-center gap-4">
                    <Button onClick={handleLearnPrev} variant="outline" className="rounded-full w-14 h-14 flex items-center justify-center text-2xl">👈</Button>
                    <Button onClick={playCurrentSound} variant="primary" className="rounded-full px-8 text-xl shadow-lg shadow-blue-200"><Volume2 className="mr-2"/> Speak</Button>
                    <Button onClick={handleLearnNext} variant="outline" className="rounded-full w-14 h-14 flex items-center justify-center text-2xl">👉</Button>
                </div>
            </div>
        ) : (
            <div className="text-center">
                <div className="bg-yellow-100 p-4 rounded-2xl mb-8 flex items-center justify-center gap-2">
                    <Star className="text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-yellow-800 text-xl">Score: {score}</span>
                </div>
                
                <h3 className="text-3xl font-black text-slate-700 mb-8 animate-pulse">{message}</h3>
                
                <div className="grid grid-cols-3 gap-4">
                    {options.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleQuizAnswer(opt)}
                            className="aspect-square bg-slate-50 hover:bg-violet-50 border-4 border-slate-100 hover:border-violet-300 rounded-3xl flex items-center justify-center text-6xl shadow-md transition-all active:scale-95"
                        >
                            {opt.emoji}
                        </button>
                    ))}
                </div>
                
                <div className="mt-8">
                    <Button onClick={() => speak(message)} variant="outline" size="sm" className="rounded-full"><Volume2 size={16} className="mr-2"/> Repeat Question</Button>
                </div>
            </div>
        )}
    </div>
  );
};