import React, { useState, useEffect, useRef } from 'react';
import { Poem } from '../types';
import { generatePoem } from '../services/geminiService';
import { Button } from './Button';
import { Loader } from './Loader';
import { RefreshCw, PlayCircle, StopCircle, Sparkles, Moon, Sun, Cloud, Rocket, Music, Star, ArrowLeft, Tv } from 'lucide-react';

interface PoemDisplayProps {
  grade: number;
  onExit: () => void;
}

const CLASSIC_VIDEOS = [
    { 
      id: 'twinkle', 
      title: "Twinkle Little Star", 
      theme: "Space", 
      content: "Twinkle, twinkle, little star,\nHow I wonder what you are!\nUp above the world so high,\nLike a diamond in the sky." 
    },
    { 
      id: 'sheep', 
      title: "Baa Baa Black Sheep", 
      theme: "Farm", 
      content: "Baa, baa, black sheep,\nHave you any wool?\nYes sir, yes sir,\nThree bags full.\nOne for the master,\nOne for the dame,\nAnd one for the little boy\nWho lives down the lane." 
    },
    { 
      id: 'rain', 
      title: "Rain Rain Go Away", 
      theme: "Weather", 
      content: "Rain, rain, go away,\nCome again another day.\nLittle children want to play,\nRain, rain, go away!" 
    },
    { 
      id: 'wheels', 
      title: "Wheels on the Bus", 
      theme: "City", 
      content: "The wheels on the bus go round and round,\nRound and round, round and round.\nThe wheels on the bus go round and round,\nAll through the town!" 
    }
];

const POPULAR_TOPICS = ["Funny Robot", "My Pet Dinosaur", "Magic School Bus", "Deep Blue Sea", "Jungle Party"];

export const PoemDisplay: React.FC<PoemDisplayProps> = ({ grade, onExit }) => {
  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeLine, setActiveLine] = useState(-1);
  const [view, setView] = useState<'gallery' | 'player'>('gallery');

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const fetchPoem = async (topic?: string) => {
    stopSpeech();
    setLoading(true);
    const data = await generatePoem(grade); 
    setPoem(data);
    setView('player');
    setLoading(false);
  };

  const loadClassic = (classic: any) => {
      stopSpeech();
      setPoem(classic);
      setView('player');
  };

  const stopSpeech = () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveLine(-1);
  };

  useEffect(() => {
    return () => stopSpeech();
  }, []);

  const handleSpeak = () => {
    if (!poem) return;

    if (isSpeaking) {
      stopSpeech();
      return;
    }

    const lines = poem.content.split('\n').filter(l => l.trim().length > 0);
    let currentLine = 0;

    // We split the speech into lines to track progress (Karaoke style)
    // Note: This is a simple approximation. For perfect sync we'd need word boundary events which are inconsistent in browsers.
    
    const speakLine = (index: number) => {
        if (index >= lines.length) {
            setIsSpeaking(false);
            setActiveLine(-1);
            return;
        }

        setActiveLine(index);
        const u = new SpeechSynthesisUtterance(lines[index]);
        u.rate = 0.9;
        u.pitch = 1.1;
        u.lang = 'en-US';
        
        u.onend = () => {
            speakLine(index + 1);
        };
        
        speechRef.current = u;
        window.speechSynthesis.speak(u);
    };

    setIsSpeaking(true);
    speakLine(0);
  };

  // Logic to determine visual theme based on keywords
  const getThemeClass = () => {
    if (!poem) return "bg-gradient-to-br from-pink-100 to-blue-100";
    const text = (poem.title + poem.content + poem.theme).toLowerCase();
    
    if (text.includes('space') || text.includes('moon') || text.includes('star')) {
        return "bg-slate-900"; // Space Theme
    }
    if (text.includes('farm') || text.includes('sheep') || text.includes('cow')) {
        return "bg-green-100"; // Farm Theme
    }
    if (text.includes('rain') || text.includes('weather') || text.includes('cloud')) {
        return "bg-slate-300"; // Weather Theme
    }
    if (text.includes('city') || text.includes('bus') || text.includes('town')) {
        return "bg-yellow-100"; // City Theme
    }
    if (text.includes('sea') || text.includes('ocean') || text.includes('fish')) {
        return "bg-cyan-200"; // Ocean Theme
    }
    return "bg-gradient-to-br from-indigo-100 to-purple-100"; // Default
  };

  const VideoOverlay = () => {
      if (!poem) return null;
      const text = (poem.title + poem.content + poem.theme).toLowerCase();
      
      const isSpace = text.includes('space') || text.includes('moon') || text.includes('star');
      const isFarm = text.includes('farm') || text.includes('sheep');
      const isRain = text.includes('rain') || text.includes('weather');
      const isCity = text.includes('city') || text.includes('bus');

      return (
        <div className={`absolute inset-0 overflow-hidden rounded-[2rem] z-0 ${getThemeClass()} transition-colors duration-1000`}>
            {/* Space Elements */}
            {isSpace && (
                <>
                    <div className="absolute top-10 right-10 text-yellow-100 animate-spin-slow"><Moon size={80} /></div>
                    <div className="absolute bottom-20 left-20 text-white animate-bounce-slow"><Rocket size={100} /></div>
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, animationDelay: `${Math.random()}s`}}></div>
                    ))}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl animate-pulse">⭐</div>
                </>
            )}

            {/* Farm Elements */}
            {isFarm && (
                <>
                    <div className="absolute top-10 left-10 text-yellow-400 animate-spin-slow"><Sun size={100} /></div>
                    <div className="absolute bottom-0 w-full h-1/3 bg-green-500 rounded-t-[50%] scale-150"></div>
                    <div className="absolute bottom-10 left-1/4 text-8xl animate-bounce">🐑</div>
                    <div className="absolute bottom-20 right-1/4 text-8xl animate-bounce-slow" style={{animationDelay: '1s'}}>🐄</div>
                    <div className="absolute top-20 right-20 text-white/80 animate-float"><Cloud size={120} /></div>
                </>
            )}

            {/* Rain Elements */}
            {isRain && (
                <>
                    <div className="absolute top-0 w-full h-full bg-slate-400/30"></div>
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="absolute text-blue-500 text-4xl animate-fall" style={{top: `-10%`, left: `${Math.random()*100}%`, animationDuration: `${1+Math.random()}s`, animationDelay: `${Math.random()}s`}}>💧</div>
                    ))}
                    <div className="absolute top-20 left-20 text-slate-500 animate-float"><Cloud size={150} /></div>
                    <div className="absolute top-40 right-40 text-slate-500 animate-float-delayed"><Cloud size={120} /></div>
                    <div className="absolute bottom-10 right-1/4 text-8xl animate-bounce">☔</div>
                </>
            )}

            {/* City Elements */}
            {isCity && (
                <>
                     <div className="absolute bottom-0 w-full h-1/4 bg-slate-700"></div>
                     <div className="absolute bottom-[25%] w-full h-2 bg-yellow-400 border-dashed border-x-8 border-transparent"></div>
                     <div className="absolute bottom-20 left-[-100px] text-9xl animate-drive">🚌</div>
                     <div className="absolute top-10 left-10 text-yellow-400"><Sun size={80} /></div>
                     <div className="absolute top-20 right-20 text-white/80"><Cloud size={100} /></div>
                </>
            )}

            {/* Default Elements */}
            {!isSpace && !isFarm && !isRain && !isCity && (
                 <>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
                        <Sparkles size={300} className="text-white animate-spin-slow" />
                    </div>
                    <div className="absolute top-1/4 left-1/4 text-6xl animate-float">🎈</div>
                    <div className="absolute bottom-1/4 right-1/4 text-6xl animate-float-delayed">🧸</div>
                 </>
            )}
        </div>
      );
  };

  if (loading) return <Loader message="Creating your magical video..." />;

  // VIEW: GALLERY
  if (view === 'gallery') {
      return (
        <div className="w-full max-w-6xl mx-auto animate-pop">
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-[2rem] shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={onExit} className="rounded-full bg-slate-100 border-none"><ArrowLeft className="w-4 h-4 mr-2"/> Exit</Button>
                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-2">
                        <Tv className="text-pink-500" /> Video Library
                    </h2>
                </div>
                <div className="bg-pink-100 text-pink-600 px-4 py-1 rounded-full font-bold text-sm">
                    Grade {grade}
                </div>
            </div>

            {/* Classic Videos Section */}
            <div className="mb-10">
                <h3 className="text-xl font-black text-slate-600 mb-4 ml-4 uppercase tracking-wider">Classic Hits 🎵</h3>
                <div className="grid md:grid-cols-4 gap-6">
                    {CLASSIC_VIDEOS.map((vid) => (
                        <button 
                            key={vid.id}
                            onClick={() => loadClassic(vid)}
                            className="group relative aspect-video bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-4 border-white"
                        >
                            <div className={`absolute inset-0 ${vid.theme === 'Space' ? 'bg-slate-800' : vid.theme === 'Farm' ? 'bg-green-200' : vid.theme === 'Weather' ? 'bg-blue-300' : 'bg-yellow-200'}`}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white/30 backdrop-blur rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <PlayCircle className="w-10 h-10 text-white" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent">
                                <h4 className="text-white font-black text-lg shadow-black drop-shadow-md">{vid.title}</h4>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* AI Generator Section */}
            <div>
                <h3 className="text-xl font-black text-slate-600 mb-4 ml-4 uppercase tracking-wider">Create New Video ✨</h3>
                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {POPULAR_TOPICS.map((topic) => (
                        <button
                            key={topic}
                            onClick={() => fetchPoem(topic)}
                            className="p-4 bg-white rounded-2xl shadow-sm border-2 border-slate-100 hover:border-pink-300 hover:bg-pink-50 transition-all font-bold text-slate-600 flex items-center gap-2 group"
                        >
                            <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 text-lg">✨</span>
                            {topic}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      );
  }

  // VIEW: PLAYER
  if (!poem) return null;

  return (
    <div className="w-full max-w-5xl mx-auto animate-pop">
       <div className="flex justify-between items-center mb-6">
          <Button variant="outline" size="sm" onClick={() => {stopSpeech(); setView('gallery');}} className="bg-white rounded-full"><ArrowLeft className="w-4 h-4 mr-2"/> Back to Gallery</Button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => fetchPoem()} className="rounded-full"><RefreshCw className="w-4 h-4 mr-2"/> New Surprise</Button>
          </div>
       </div>

       <div className="bg-black rounded-[3rem] shadow-2xl relative border-8 border-slate-800 overflow-hidden aspect-video md:aspect-[16/9]">
            
            {/* The "Screen" */}
            <VideoOverlay />

            {/* Subtitles / Karaoke Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 p-8 z-10 pointer-events-none">
                 <div className="bg-black/40 backdrop-blur-md p-8 rounded-3xl max-w-3xl w-full text-center transition-all duration-300">
                     <h2 className="text-2xl md:text-3xl font-black text-yellow-300 mb-6 drop-shadow-md">{poem.title}</h2>
                     <div className="space-y-4">
                        {poem.content.split('\n').filter(l => l.trim()).map((line, idx) => (
                            <p 
                                key={idx} 
                                className={`text-xl md:text-2xl font-black transition-all duration-300 leading-relaxed ${
                                    activeLine === idx 
                                    ? 'text-white scale-110 bg-pink-500/50 px-4 py-1 rounded-xl shadow-lg' 
                                    : 'text-white/40'
                                }`}
                            >
                                {line}
                            </p>
                        ))}
                     </div>
                 </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center z-20 pointer-events-auto">
                 <button 
                    onClick={handleSpeak}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl border-4 border-white ${isSpeaking ? 'bg-red-500' : 'bg-green-500'}`}
                 >
                    {isSpeaking ? <StopCircle size={40} className="text-white fill-white"/> : <PlayCircle size={40} className="text-white fill-white" />}
                 </button>
            </div>
       </div>

       <div className="mt-6 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
           AI Video Player • Theme: {poem.theme}
       </div>

       <style>{`
        @keyframes drive {
            from { left: -150px; }
            to { left: 100%; }
        }
        @keyframes fall {
            from { top: -10%; opacity: 1; }
            to { top: 100%; opacity: 0; }
        }
        .animate-drive {
            animation: drive 10s linear infinite;
        }
        .animate-fall {
            animation: fall 1s linear infinite;
        }
       `}</style>
    </div>
  );
};
