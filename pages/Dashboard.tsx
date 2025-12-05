
import React, { useState, useEffect, useRef } from 'react';
import { Subject, GameType, User } from '../types';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { LogOut, User as UserIcon, Star, BookOpen, Keyboard, Brain, Sparkles, Calculator, Cpu, Pencil, Microscope, Globe, ScrollText, Gamepad2, Tv, Smile, Wind, HelpCircle, Music } from 'lucide-react';
import { QuizGame } from '../components/QuizGame';
import { TypingGame } from '../components/TypingGame';
import { PoemDisplay } from '../components/PoemDisplay';
import { GamesHub } from '../components/GamesHub';
import { BookReader } from '../components/BookReader';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const JOKES = [
  "Why did the math book look sad? Because it had too many problems!",
  "What do you call a bear with no teeth? A gummy bear!",
  "Why do bees have sticky hair? Because they use honeycombs!",
  "What falls but never breaks? Nightfall!",
  "Why did the cookie go to the hospital? Because he felt crummy!"
];

const RIDDLES = [
    { q: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", a: "An Echo" },
    { q: "I have keys but no locks. I have a space but no room. You can enter, but can't go outside. What am I?", a: "A Keyboard" },
    { q: "What has to be broken before you can use it?", a: "An Egg" },
    { q: "I’m tall when I’m young, and I’m short when I’m old. What am I?", a: "A Candle" }
];

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(user.grade);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null);
  const [dailyJoke, setDailyJoke] = useState(JOKES[0]);
  const [dailyRiddle, setDailyRiddle] = useState(RIDDLES[0]);
  const [showRiddleAnswer, setShowRiddleAnswer] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastResult, setLastResult] = useState<{score: number, msg: string} | null>(null);

  // Audio Ref for Breathing
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const startBreathingSound = () => {
    try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime); 
        
        // LFO for breathing volume
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.125; // 8 seconds cycle (4 in, 4 out)
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.3; // Depth
        
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        lfo.start();
        
        // Base volume
        gain.gain.value = 0.1;

        audioContextRef.current = ctx;
        oscRef.current = osc;
        gainRef.current = gain;
    } catch (e) {
        console.error("Audio not supported");
    }
  };

  const stopBreathingSound = () => {
      if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
      }
  };

  useEffect(() => {
      if (showBreathing) {
          startBreathingSound();
      } else {
          stopBreathingSound();
      }
      return () => stopBreathingSound();
  }, [showBreathing]);

  const handleStartGame = (type: GameType) => {
    setSelectedGameType(type);
    setIsPlaying(true);
    setLastResult(null);
  };

  const handleGameComplete = (score: number, accuracy?: number, wpm?: number) => {
    setIsPlaying(false);
    setSelectedSubject(null); // Go back to dashboard
    setSelectedGameType(null);
    let msg = `Great Job! Score: ${score}%`;
    if (wpm !== undefined) {
      msg = `Amazing! ${wpm} WPM with ${accuracy}% Accuracy.`;
    }
    setLastResult({ score, msg });
  };

  const handleExitGame = () => {
    setIsPlaying(false);
    setSelectedGameType(null);
    // If we were in a game inside a subject, we go back to the book (which is just subject selected)
    // If we want to exit the book entirely:
    if (selectedGameType === GameType.ARCADE) {
        // Arcade exit
    } else {
        // Just clear game type, so it shows book again
    }
  };

  const handleBookExit = () => {
      setSelectedSubject(null);
      setIsPlaying(false);
  }

  const handleArcadeOpen = () => {
    setSelectedSubject(null); 
    setSelectedGameType(GameType.ARCADE);
    setIsPlaying(true);
  };

  const handleSubjectSelect = (sub: Subject) => {
    setSelectedSubject(sub);
    setLastResult(null);
    if (sub === Subject.POEMS) {
        setSelectedGameType(GameType.READING);
        setIsPlaying(true);
    } else {
        // For other subjects, we now show the BOOK READER first, so we don't set a game type yet.
        setSelectedGameType(null); 
        setIsPlaying(true);
    }
  };

  // Helper to get color and icon for subject
  const getSubjectTheme = (sub: Subject) => {
    switch(sub) {
        case Subject.MATH: return { color: 'bg-cyan-500', spine: 'bg-cyan-700', bg: 'bg-cyan-100', icon: Calculator, text: 'text-cyan-600' };
        case Subject.ENGLISH: return { color: 'bg-pink-500', spine: 'bg-pink-700', bg: 'bg-pink-100', icon: BookOpen, text: 'text-pink-600' };
        case Subject.COMPUTER: return { color: 'bg-blue-500', spine: 'bg-blue-700', bg: 'bg-blue-100', icon: Cpu, text: 'text-blue-600' };
        case Subject.AI: return { color: 'bg-violet-600', spine: 'bg-violet-800', bg: 'bg-violet-100', icon: Brain, text: 'text-violet-600' };
        case Subject.SCIENCE: return { color: 'bg-green-500', spine: 'bg-green-700', bg: 'bg-green-100', icon: Microscope, text: 'text-green-600' };
        case Subject.GEOGRAPHY: return { color: 'bg-emerald-500', spine: 'bg-emerald-700', bg: 'bg-emerald-100', icon: Globe, text: 'text-emerald-600' };
        case Subject.HISTORY: return { color: 'bg-amber-500', spine: 'bg-amber-700', bg: 'bg-amber-100', icon: ScrollText, text: 'text-amber-600' };
        case Subject.POEMS: return { color: 'bg-rose-500', spine: 'bg-rose-700', bg: 'bg-rose-100', icon: Tv, text: 'text-rose-600' };
        default: return { color: 'bg-gray-500', spine: 'bg-gray-700', bg: 'bg-gray-100', icon: BookOpen, text: 'text-gray-600' };
    }
  };

  // RENDER GAME SCREEN
  if (isPlaying) {
    return (
      <div className="min-h-screen p-4 md:p-6 flex flex-col items-center justify-center font-fredoka">
        <div className="w-full max-w-6xl">
            {selectedGameType === GameType.ARCADE ? (
                <GamesHub onExit={handleExitGame} />
            ) : selectedGameType === GameType.READING && selectedSubject === Subject.POEMS ? (
                <PoemDisplay grade={selectedGrade} onExit={handleExitGame} />
            ) : selectedGameType === GameType.QUIZ && selectedSubject ? (
                <QuizGame 
                    subject={selectedSubject} 
                    grade={selectedGrade} 
                    onComplete={handleGameComplete}
                    onExit={handleExitGame}
                />
            ) : selectedGameType === GameType.TYPING && selectedSubject ? (
                <TypingGame 
                    subject={selectedSubject} 
                    grade={selectedGrade} 
                    onComplete={handleGameComplete}
                    onExit={handleExitGame}
                />
            ) : selectedSubject ? (
                // If subject selected but no game type, show BOOK READER
                <BookReader 
                    subject={selectedSubject}
                    grade={selectedGrade}
                    onStartQuiz={() => handleStartGame(GameType.QUIZ)}
                    onStartTyping={() => handleStartGame(GameType.TYPING)}
                    onExit={handleBookExit}
                />
            ) : (
                <div className="text-center">Nothing selected.</div>
            )}
        </div>
      </div>
    );
  }

  // RENDER DASHBOARD
  return (
    <div className="min-h-screen flex flex-col font-fredoka relative">
      
      {/* Breathing Modal */}
      {showBreathing && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="glass-card bg-white/90 p-12 text-center max-w-lg w-full relative animate-pop">
                   <button onClick={() => setShowBreathing(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200"><LogOut size={20}/></button>
                   <h2 className="text-2xl font-black text-slate-700 mb-8">Breathe In... Breathe Out...</h2>
                   <div className="w-48 h-48 bg-sky-200 rounded-full mx-auto animate-ping opacity-50 absolute left-1/2 -translate-x-1/2 top-32" style={{animationDuration: '4s'}}></div>
                   <div className="w-48 h-48 bg-sky-400 rounded-full mx-auto relative flex items-center justify-center shadow-xl animate-pulse" style={{animationDuration: '4s'}}>
                        <Wind className="text-white w-20 h-20" />
                   </div>
                   <p className="mt-12 text-slate-500 font-medium">Listen to the sound and relax... 🧘</p>
              </div>
          </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-20 pb-4 pt-4 px-4">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center glass-card">
            <Logo size="sm" />

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full border-b-4 border-yellow-200 shadow-sm">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" />
                    <span className="font-extrabold text-yellow-700">{user.xp} XP</span>
                </div>
                <div className="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl border border-white">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                         <UserIcon className="w-5 h-5 text-slate-500" />
                    </div>
                    <span className="font-bold text-slate-700 hidden sm:block">{user.username}</span>
                    <span className="text-xs font-bold bg-white px-2 py-1 rounded text-slate-600 border border-slate-100">Gr {selectedGrade}</span>
                </div>
                <button onClick={onLogout} className="px-4 py-2 bg-red-500 rounded-xl text-white font-bold shadow-[0_4px_0_#991b1b] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 text-sm">
                    <LogOut className="w-4 h-4" /> Exit
                </button>
            </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        
        {/* Results Notification */}
        {lastResult && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-3xl shadow-xl flex items-center justify-between animate-pop border-b-8 border-green-600">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full"><Star className="w-8 h-8 text-yellow-300 fill-yellow-300" /></div>
                    <span className="font-extrabold text-2xl">{lastResult.msg}</span>
                </div>
                <button className="bg-white text-green-600 px-6 py-2 rounded-full font-bold border-b-4 border-green-200 active:translate-y-1 active:border-b-0" onClick={() => setLastResult(null)}>Close</button>
            </div>
        )}

        {/* Fun Zone Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* Joke Card */}
            <div className="glass-card bg-white/80 p-6 flex items-center gap-4 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                 <div className="bg-yellow-300 p-4 rounded-2xl text-3xl shadow-[4px_4px_0px_#ca8a04]">😂</div>
                 <div className="flex-1 z-10">
                     <h3 className="font-black text-slate-400 text-xs uppercase mb-1">Joke of the Day</h3>
                     <p className="font-bold text-slate-700 leading-snug text-sm">"{dailyJoke}"</p>
                 </div>
                 <button onClick={() => setDailyJoke(JOKES[Math.floor(Math.random() * JOKES.length)])} className="absolute top-4 right-4 text-slate-300 hover:text-yellow-500"><Smile size={20}/></button>
            </div>

            {/* Riddle Card */}
            <div className="glass-card bg-white/80 p-6 flex items-center gap-4 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                 <div className="bg-purple-300 p-4 rounded-2xl text-white shadow-[4px_4px_0px_#7c3aed]"><HelpCircle size={32}/></div>
                 <div className="flex-1 z-10">
                     <h3 className="font-black text-slate-400 text-xs uppercase mb-1">Brain Riddle</h3>
                     <p className="font-bold text-slate-700 leading-snug text-sm mb-2">{dailyRiddle.q}</p>
                     {showRiddleAnswer ? (
                        <span className="text-purple-600 font-black animate-pop">{dailyRiddle.a}</span>
                     ) : (
                        <button onClick={() => setShowRiddleAnswer(true)} className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded hover:bg-purple-200 font-bold">Show Answer</button>
                     )}
                 </div>
                 <button onClick={() => { setDailyRiddle(RIDDLES[Math.floor(Math.random() * RIDDLES.length)]); setShowRiddleAnswer(false); }} className="absolute top-4 right-4 text-slate-300 hover:text-purple-500"><Smile size={20}/></button>
            </div>

            {/* Zen Mode */}
            <button onClick={() => setShowBreathing(true)} className="glass-card bg-white/80 p-6 flex items-center gap-4 text-left group hover:scale-[1.02] transition-transform">
                 <div className="bg-sky-300 p-4 rounded-2xl text-white shadow-[4px_4px_0px_#0369a1]"><Wind size={32}/></div>
                 <div>
                     <h3 className="font-black text-slate-400 text-xs uppercase mb-1">Relax Mode</h3>
                     <p className="font-bold text-slate-700 text-lg">Sound & Breathe 🧘</p>
                 </div>
            </button>
        </div>

        {/* Grade Selector */}
        <div className="mb-10 glass-card bg-white/60 p-6 rounded-[2rem]">
            <div className="flex items-center gap-2 mb-4">
                 <div className="p-1.5 bg-indigo-100 rounded-lg"><Pencil className="w-4 h-4 text-indigo-600"/></div>
                 <h2 className="text-lg font-black text-indigo-900 uppercase tracking-wider">Select Your Grade</h2>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                    <button
                        key={g}
                        onClick={() => { setSelectedGrade(g); setSelectedSubject(null); }}
                        className={`min-w-[4rem] h-14 rounded-2xl font-black text-xl transition-all border-b-4 active:border-b-0 active:translate-y-1 ${
                            selectedGrade === g 
                            ? 'bg-violet-600 text-white border-violet-800 shadow-lg transform -translate-y-2' 
                            : 'bg-white text-slate-400 border-slate-200 hover:border-violet-300'
                        }`}
                    >
                        {g}
                    </button>
                ))}
            </div>
        </div>

        {/* ARCADE GAME BOX */}
        <div className="mb-16 animate-float perspective-3d">
             <button 
                onClick={handleArcadeOpen}
                className="w-full relative group overflow-hidden rounded-[2.5rem] shadow-[0_30px_60px_-10px_rgba(255,255,255,0.4)] transition-transform hover:scale-[1.01]"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 animate-gradient-xy"></div>
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] border-4 border-white/50 rounded-[2.5rem]"></div>

                <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 z-10">
                    <div className="flex items-center gap-6 text-white text-left">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border-4 border-white/30 shadow-[inset_0_0_20px_rgba(255,255,255,0.3)] transform group-hover:rotate-12 transition-transform duration-500">
                             <Gamepad2 className="w-14 h-14 drop-shadow-lg" />
                        </div>
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black mb-2 drop-shadow-md tracking-tight">Fun Games Arcade</h2>
                            <p className="text-xl font-bold text-white/90">Music, Painting, Puzzles & More!</p>
                        </div>
                    </div>
                    
                    <div className="bg-white/20 backdrop-blur rounded-full px-8 py-4 font-black text-xl text-white border-2 border-white/50 shadow-lg group-hover:bg-white group-hover:text-pink-500 transition-colors">
                        Open Arcade 🕹️
                    </div>
                </div>
             </button>
        </div>

        {/* SUBJECT BOOKSHELF */}
        <div>
           <div className="flex items-center gap-2 mb-8">
               <div className="p-1.5 bg-pink-100 rounded-lg"><BookOpen className="w-4 h-4 text-pink-600"/></div>
               <h2 className="text-lg font-black text-pink-900 uppercase tracking-wider">Pick a Subject Book</h2>
           </div>

           {/* The Shelf */}
           <div className="perspective-3d">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 px-8 py-12 wood-shelf rounded-xl">
                   {Object.values(Subject).map((sub) => {
                       const theme = getSubjectTheme(sub);
                       return (
                           <button 
                               key={sub}
                               onClick={() => handleSubjectSelect(sub)}
                               className="group relative book w-full aspect-[3/4]"
                           >
                               <div className={`book-cover absolute inset-0 ${theme.color} flex flex-col items-center justify-center p-4 text-center border-l-4 border-white/20`}>
                                    <div className="bg-white/20 p-4 rounded-full mb-4 shadow-inner backdrop-blur-sm">
                                        <theme.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <span className="text-white font-black text-lg md:text-xl uppercase drop-shadow-md">{sub}</span>
                                    <div className="mt-auto text-xs font-bold text-white/60 bg-black/10 px-2 py-1 rounded">Grade {selectedGrade}</div>
                               </div>
                               <div className={`book-spine ${theme.spine}`}></div>
                               <div className="book-pages"></div>
                           </button>
                       )
                   })}
               </div>
           </div>
       </div>

      </main>
    </div>
  );
};