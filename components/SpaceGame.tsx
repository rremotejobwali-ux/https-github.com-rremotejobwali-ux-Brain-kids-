import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { X, Rocket, Star } from 'lucide-react';

export const SpaceGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [playerX, setPlayerX] = useState(50); // percentage
  const [obstacles, setObstacles] = useState<{id: number, x: number, y: number, type: 'rock'|'star'}[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameLoopRef = useRef<number | null>(null);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setObstacles([]);
    setPlayerX(50);
  };

  // Move Player
  const handleMouseMove = (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      setPlayerX(Math.min(90, Math.max(10, x)));
  };

  useEffect(() => {
      if (!isPlaying || gameOver) {
          if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
          return;
      }

      let lastSpawn = 0;

      const loop = (time: number) => {
          if (time - lastSpawn > 800) { // Spawn every 800ms
              lastSpawn = time;
              const type = Math.random() > 0.8 ? 'star' : 'rock';
              setObstacles(prev => [...prev, {
                  id: time,
                  x: Math.random() * 80 + 10,
                  y: -10,
                  type
              }]);
          }

          setObstacles(prev => {
              const next = [];
              for (const obs of prev) {
                  const newY = obs.y + 1.5; // Speed
                  
                  // Collision Detection (Approximate)
                  if (newY > 80 && newY < 95 && Math.abs(obs.x - playerX) < 10) {
                      if (obs.type === 'rock') {
                          setGameOver(true);
                          setIsPlaying(false);
                      } else {
                          setScore(s => s + 10);
                          continue; // Remove star
                      }
                  }

                  if (newY < 110) next.push({ ...obs, y: newY });
              }
              return next;
          });

          if (!gameOver) {
            gameLoopRef.current = requestAnimationFrame(loop);
          }
      };

      gameLoopRef.current = requestAnimationFrame(loop);

      return () => {
          if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      };
  }, [isPlaying, gameOver, playerX]);

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-900 p-6 rounded-[3rem] shadow-2xl border-4 border-slate-700 relative overflow-hidden">
        
        {/* Stars Background */}
        <div className="absolute inset-0 opacity-50 pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <div key={i} className="absolute bg-white rounded-full w-1 h-1 animate-pulse" style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, animationDelay: `${Math.random()}s` }}></div>
            ))}
        </div>

        <div className="flex justify-between items-center mb-4 relative z-10 text-white">
            <h2 className="text-xl font-black flex items-center gap-2">
                <Rocket className="w-6 h-6 text-orange-500"/> Space Dash
            </h2>
            <div className="flex gap-4 items-center">
                 <div className="bg-white/20 px-4 py-1 rounded-full font-bold">Score: {score}</div>
                 <Button size="sm" variant="danger" onClick={onExit}><X size={16}/></Button>
            </div>
        </div>

        <div 
            className="w-full h-96 bg-slate-800 rounded-3xl relative overflow-hidden cursor-none touch-none shadow-inner border-2 border-slate-600"
            onMouseMove={handleMouseMove}
            onTouchMove={(e) => {
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
                setPlayerX(Math.min(90, Math.max(10, x)));
            }}
        >
            {!isPlaying && !gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                    <Button onClick={startGame} size="lg" className="animate-pulse bg-orange-500 hover:bg-orange-600 shadow-orange-500">Launch Rocket 🚀</Button>
                </div>
            )}
            
            {gameOver && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-white animate-pop">
                    <div className="text-6xl mb-4">💥</div>
                    <h3 className="text-3xl font-black mb-2">CRASH!</h3>
                    <p className="mb-6 font-bold text-slate-400">Score: {score}</p>
                    <Button onClick={startGame} size="lg" className="bg-orange-500 hover:bg-orange-600">Try Again</Button>
                </div>
            )}

            {/* Player */}
            <div 
                className="absolute bottom-4 -translate-x-1/2 transition-transform duration-75 text-5xl drop-shadow-[0_0_15px_rgba(255,165,0,0.8)]"
                style={{ left: `${playerX}%` }}
            >
                🚀
                {/* Engine Flame */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-6 bg-gradient-to-b from-orange-400 to-transparent rounded-full animate-pulse"></div>
            </div>

            {/* Obstacles */}
            {obstacles.map(obs => (
                <div 
                    key={obs.id}
                    className="absolute -translate-x-1/2 text-4xl"
                    style={{ left: `${obs.x}%`, top: `${obs.y}%` }}
                >
                    {obs.type === 'rock' ? '🪨' : '⭐'}
                </div>
            ))}
        </div>
        
        <p className="text-center text-slate-500 text-xs mt-4 font-bold uppercase tracking-widest">Move mouse to Dodge Rocks & Collect Stars</p>
    </div>
  );
};