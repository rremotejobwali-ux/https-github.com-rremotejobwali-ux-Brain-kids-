import React, { useState } from 'react';
import { Button } from './Button';
import { Play, ArrowLeft } from 'lucide-react';
import { MemoryGame } from './MemoryGame';
import { BalloonGame } from './BalloonGame';
import { ScrambleGame } from './ScrambleGame';
import { SimonGame } from './SimonGame';
import { EmojiMathGame } from './EmojiMathGame';
import { PaintingCanvas } from './PaintingCanvas';
import { EnglishLearningGame } from './EnglishLearningGame';
import { MusicStudio } from './MusicStudio';
import { MoleGame } from './MoleGame';
import { SpaceGame } from './SpaceGame';
import { AIChatBuddy } from './AIChatBuddy';

interface GamesHubProps {
  onExit: () => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({ onExit }) => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  if (activeGame === 'memory') return <MemoryGame onExit={() => setActiveGame(null)} />;
  if (activeGame === 'balloon') return <BalloonGame onExit={() => setActiveGame(null)} />;
  if (activeGame === 'scramble') return <ScrambleGame onExit={() => setActiveGame(null)} />;
  if (activeGame === 'simon') return <SimonGame onExit={() => setActiveGame(null)} />;
  if (activeGame === 'emojimath') return <EmojiMathGame onExit={() => setActiveGame(null)} />;
  if (activeGame === 'paint') return <PaintingCanvas onExit={() => setActiveGame(null)} />;
  if (activeGame === 'englishabc') return <EnglishLearningGame onExit={() => setActiveGame(null)} />;
  if (activeGame === 'music') return <MusicStudio onExit={() => setActiveGame(null)} />;
  if (activeGame === 'mole') return <MoleGame onExit={() => setActiveGame(null)} />;
  if (activeGame === 'space') return <SpaceGame onExit={() => setActiveGame(null)} />;
  if (activeGame === 'robo') return <AIChatBuddy onExit={() => setActiveGame(null)} />;

  const games = [
    { id: 'robo', name: 'Talk to Robo', icon: '🤖', color: 'cyan', desc: 'Chat with your AI friend!' },
    { id: 'englishabc', name: 'Nursery ABCs', icon: '🗣️', color: 'indigo', desc: 'Learn to speak English.' },
    { id: 'mole', name: 'Mole Boink', icon: '🐹', color: 'green', desc: 'Whack the moles fast!' },
    { id: 'space', name: 'Space Dash', icon: '🚀', color: 'orange', desc: 'Dodge asteroids in space.' },
    { id: 'paint', name: 'Paint Studio', icon: '🎨', color: 'pink', desc: 'Draw with 3D Stickers!' },
    { id: 'music', name: 'Music Studio', icon: '🎹', color: 'teal', desc: 'Play Piano & Drums.' },
    { id: 'memory', name: 'Memory Match', icon: '🧠', color: 'violet', desc: 'Find the matching pairs.' },
    { id: 'balloon', name: 'Balloon Math', icon: '🎈', color: 'sky', desc: 'Pop the correct answers.' },
    { id: 'scramble', name: 'Word Scramble', icon: '🔤', color: 'pink', desc: 'Fix the mixed-up words.' },
    { id: 'simon', name: 'Simon Says', icon: '🔔', color: 'green', desc: 'Follow the color pattern.' },
    { id: 'emojimath', name: 'Emoji Logic', icon: '🍎', color: 'orange', desc: 'Solve the picture puzzle.' },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={onExit} className="rounded-full bg-white/50 backdrop-blur border-white"><ArrowLeft className="w-4 h-4 mr-2"/> Back</Button>
        <h2 className="text-3xl font-black text-white flex items-center gap-2 drop-shadow-md">
            Arcade Zone <span className="text-4xl animate-bounce-slow">🕹️</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map(game => (
            <div key={game.id} className={`group bg-white/90 backdrop-blur rounded-[2rem] p-3 shadow-xl hover:-translate-y-2 transition-transform duration-300 border-2 border-white`}>
                <div className={`bg-gradient-to-br from-${game.color}-50 to-${game.color}-100 rounded-[1.5rem] p-8 text-center h-full flex flex-col items-center`}>
                    <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform drop-shadow-md">{game.icon}</div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">{game.name}</h3>
                    <p className="text-slate-600 mb-6 font-medium leading-snug">{game.desc}</p>
                    <Button onClick={() => setActiveGame(game.id)} className="mt-auto w-full bg-white text-slate-800 hover:bg-white/80 shadow-md border-2 border-slate-200">
                        <Play className="w-5 h-5 mr-2 fill-current" /> Play Now
                    </Button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};