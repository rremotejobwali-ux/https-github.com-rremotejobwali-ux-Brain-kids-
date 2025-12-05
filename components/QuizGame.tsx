import React, { useState, useEffect } from 'react';
import { Subject, QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';
import { Button } from './Button';
import { Loader } from './Loader';
import { Award, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface QuizGameProps {
  subject: Subject;
  grade: number;
  onComplete: (score: number) => void;
  onExit: () => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({ subject, grade, onComplete, onExit }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      const data = await generateQuiz(subject, grade);
      setQuestions(data);
      setLoading(false);
    };
    loadQuestions();
  }, [subject, grade]);

  const handleAnswer = (option: string) => {
    if (selectedOption) return; // Prevent double click
    setSelectedOption(option);
    
    if (option === questions[currentIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      onComplete(Math.round((score + (selectedOption === questions[currentIndex].correctAnswer ? 0 : 0)) / questions.length * 100));
    }
  };

  if (loading) return <Loader message={`Asking AI for ${subject} questions (Grade ${grade})...`} />;

  if (questions.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-3xl shadow-xl">
        <div className="text-6xl mb-4">😕</div>
        <p className="text-red-500 font-bold text-xl mb-6">Oops! The AI needs a nap. Try again!</p>
        <Button onClick={onExit}>Go Back</Button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onExit} className="rounded-full">Exit</Button>
            <span className="font-bold text-slate-400">Question {currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-400">Score</span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-black text-lg">{score}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-4 bg-slate-200 rounded-full mb-8 overflow-hidden border border-slate-300">
        <div 
          className="h-full bg-gradient-to-r from-blue-400 to-violet-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border-4 border-white relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500"></div>
        
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-8 leading-snug">
            {currentQ.question}
        </h2>
        
        <div className="grid gap-4">
          {currentQ.options.map((option, idx) => {
            let btnStyle = "bg-white border-2 border-slate-100 hover:border-violet-300 hover:bg-violet-50 text-slate-600";
            let icon = <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-4 text-sm font-bold text-slate-500 group-hover:bg-violet-200 group-hover:text-violet-700 transition-colors">{String.fromCharCode(65 + idx)}</span>;

            if (selectedOption) {
              if (option === currentQ.correctAnswer) {
                  btnStyle = "bg-green-100 border-2 border-green-400 text-green-800 shadow-md transform scale-105";
                  icon = <CheckCircle className="w-8 h-8 mr-4 text-green-600" />;
              }
              else if (option === selectedOption) {
                  btnStyle = "bg-red-50 border-2 border-red-200 text-red-800 opacity-75";
                  icon = <AlertCircle className="w-8 h-8 mr-4 text-red-500" />;
              } else {
                  btnStyle = "bg-slate-50 border-transparent text-slate-300 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={!!selectedOption}
                className={`group w-full text-left flex items-center p-4 md:p-5 rounded-2xl text-lg font-bold transition-all duration-200 ${btnStyle}`}
              >
                {icon}
                <span className="flex-1">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation & Next */}
      {showExplanation && (
        <div className="animate-pop bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 shadow-lg flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 shrink-0">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-extrabold text-blue-800 mb-1 text-lg">Did you know?</h4>
              <p className="text-blue-700 font-medium leading-relaxed">{currentQ.explanation}</p>
            </div>
          </div>
          
          <Button onClick={handleNext} size="lg" className="shrink-0 bg-blue-600 hover:bg-blue-700 shadow-blue-300 shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1">
            {currentIndex === questions.length - 1 ? 'Finish!' : 'Next'} <ArrowRight className="ml-2 w-5 h-5"/>
          </Button>
        </div>
      )}
    </div>
  );
};