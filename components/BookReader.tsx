
import React, { useState, useEffect } from 'react';
import { Subject, Lesson } from '../types';
import { generateLesson } from '../services/geminiService';
import { Button } from './Button';
import { Loader } from './Loader';
import { BookOpen, Star, Keyboard, Brain, Sparkles, Volume2, ArrowLeft, Tag } from 'lucide-react';

interface BookReaderProps {
  subject: Subject;
  grade: number;
  onStartQuiz: () => void;
  onStartTyping: () => void;
  onExit: () => void;
}

export const BookReader: React.FC<BookReaderProps> = ({ subject, grade, onStartQuiz, onStartTyping, onExit }) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const loadLesson = async () => {
      setLoading(true);
      const data = await generateLesson(subject, grade);
      setLesson(data);
      setLoading(false);
    };
    loadLesson();

    return () => window.speechSynthesis.cancel();
  }, [subject, grade]);

  const handleSpeak = () => {
    if (!lesson) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      const u = new SpeechSynthesisUtterance(`${lesson.title}. ${lesson.content}. Fun Fact: ${lesson.funFact}`);
      u.rate = 0.9;
      u.pitch = 1.1;
      u.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
      setSpeaking(true);
    }
  };

  if (loading) return <Loader message={`Opening your ${subject} book...`} />;

  if (!lesson) return (
      <div className="text-center p-8 bg-white rounded-3xl">
          <p>Oops! The pages are stuck together. Try again!</p>
          <Button onClick={onExit}>Close Book</Button>
      </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto perspective-3d animate-pop">
      <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={onExit} className="bg-white/80 backdrop-blur rounded-full border-white text-slate-700">
              <ArrowLeft className="mr-2 h-4 w-4"/> Close Book
          </Button>
          <div className="bg-white/30 backdrop-blur px-4 py-1 rounded-full text-white font-bold text-sm border border-white/50">
              Grade {grade}
          </div>
      </div>

      {/* The Open Book */}
      <div className="relative bg-[#fdfbf7] rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border-8 border-[#8b5a2b] min-h-[600px]">
        {/* Spine */}
        <div className="absolute left-1/2 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-200 to-slate-100 -translate-x-1/2 z-10 shadow-inner hidden md:block"></div>

        {/* Left Page (Content) */}
        <div className="flex-1 p-8 md:p-12 md:pr-16 flex flex-col relative bg-gradient-to-r from-transparent to-black/5">
           <div className="inline-block px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4 w-fit">
               {subject}
           </div>
           
           <h2 className="text-3xl md:text-4xl font-black text-[#5c3a1b] mb-6 font-serif leading-tight">
               {lesson.title}
           </h2>
           <p className="text-lg md:text-xl text-slate-800 leading-relaxed font-serif mb-8 flex-1">
               {lesson.content}
           </p>

           {/* Keywords Section */}
           {lesson.keyWords && lesson.keyWords.length > 0 && (
               <div className="mb-6">
                   <h4 className="flex items-center gap-2 font-bold text-slate-500 mb-2 text-sm uppercase">
                       <Tag size={16} /> Key Words
                   </h4>
                   <div className="flex flex-wrap gap-2">
                       {lesson.keyWords.map((word, i) => (
                           <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-serif italic text-sm shadow-sm">
                               {word}
                           </span>
                       ))}
                   </div>
               </div>
           )}
           
           <div className="bg-yellow-100 p-4 rounded-xl border-l-4 border-yellow-400 transform -rotate-1 shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                   <Star className="text-yellow-500 fill-yellow-500 w-5 h-5" />
                   <span className="font-bold text-yellow-800 uppercase text-xs tracking-wider">Fun Fact</span>
               </div>
               <p className="text-yellow-900 font-medium italic">
                   "{lesson.funFact}"
               </p>
           </div>
           
           {/* Page Number */}
           <div className="absolute bottom-4 left-8 text-slate-400 font-serif italic text-sm">Page 1</div>
        </div>

        {/* Right Page (Actions) */}
        <div className="flex-1 p-8 md:p-12 md:pl-16 flex flex-col items-center justify-center relative bg-gradient-to-l from-transparent to-black/5 border-t md:border-t-0 border-slate-200">
            <div className="text-center mb-8">
                <div className="inline-block p-4 bg-blue-100 rounded-full text-blue-600 mb-4 animate-bounce-slow">
                    <Sparkles size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-700 mb-2">Activity Time!</h3>
                <p className="text-slate-500">Practice what you just learned</p>
            </div>

            <div className="grid gap-4 w-full max-w-xs">
                <button 
                    onClick={onStartQuiz}
                    className="flex items-center p-4 bg-white border-2 border-violet-100 hover:border-violet-500 hover:bg-violet-50 rounded-2xl shadow-md transition-all group text-left"
                >
                    <div className="bg-violet-100 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                        <Brain className="text-violet-600 w-6 h-6" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 text-lg">Take a Quiz</div>
                        <div className="text-xs text-slate-500 font-medium">Test your knowledge</div>
                    </div>
                </button>

                <button 
                    onClick={onStartTyping}
                    className="flex items-center p-4 bg-white border-2 border-pink-100 hover:border-pink-500 hover:bg-pink-50 rounded-2xl shadow-md transition-all group text-left"
                >
                    <div className="bg-pink-100 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                        <Keyboard className="text-pink-600 w-6 h-6" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 text-lg">Type it Out</div>
                        <div className="text-xs text-slate-500 font-medium">Practice writing</div>
                    </div>
                </button>
                
                <button 
                    onClick={handleSpeak}
                    className={`flex items-center p-4 border-2 rounded-2xl shadow-md transition-all group text-left ${speaking ? 'bg-green-50 border-green-500' : 'bg-white border-slate-100 hover:border-slate-400'}`}
                >
                    <div className={`p-3 rounded-xl mr-4 transition-transform ${speaking ? 'bg-green-200' : 'bg-slate-100'}`}>
                        <Volume2 className={`${speaking ? 'text-green-700' : 'text-slate-500'} w-6 h-6`} />
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 text-lg">{speaking ? 'Stop Reading' : 'Read to Me'}</div>
                        <div className="text-xs text-slate-500 font-medium">Listen to the lesson</div>
                    </div>
                </button>
            </div>

            {/* Page Number */}
            <div className="absolute bottom-4 right-8 text-slate-400 font-serif italic text-sm">Page 2</div>
        </div>
      </div>
    </div>
  );
};