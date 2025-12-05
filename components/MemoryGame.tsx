import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { RefreshCw, Star } from 'lucide-react';

interface Card {
  id: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const GAME_ICONS = ['🍎', '🐶', '🚀', '⚽', '🌟', '🎸', '🍦', '🐘'];

export const MemoryGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);

  const initializeGame = () => {
    const duplicatedIcons = [...GAME_ICONS, ...GAME_ICONS];
    const shuffled = duplicatedIcons
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        content: icon,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleCardClick = (id: number) => {
    // Prevent clicking if 2 cards already flipped or card is already matched/flipped
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [firstId, secondId] = newFlipped;
      
      if (cards[firstId].content === cards[secondId].content) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstId].isMatched = true;
          matchedCards[secondId].isMatched = true;
          // Keep them flipped
          matchedCards[firstId].isFlipped = true;
          matchedCards[secondId].isFlipped = true; 
          setCards(matchedCards);
          setFlippedCards([]);
          setMatches(prev => prev + 1);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstId].isFlipped = false;
          resetCards[secondId].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const isWin = matches === GAME_ICONS.length;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <span className="text-2xl">🧠</span> Memory Match
        </h2>
        <div className="flex gap-4 items-center">
            <div className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">Moves: {moves}</div>
            <Button size="sm" variant="danger" onClick={onExit}>Exit</Button>
        </div>
      </div>

      {isWin ? (
        <div className="text-center p-12 bg-white rounded-3xl shadow-xl animate-pop">
            <div className="text-8xl mb-4">🏆</div>
            <h2 className="text-4xl font-black text-slate-800 mb-4">You Won!</h2>
            <p className="text-xl text-slate-500 mb-8">Amazing memory! You did it in {moves} moves.</p>
            <Button onClick={initializeGame} size="lg" className="animate-pulse">Play Again</Button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
            {cards.map(card => (
                <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`aspect-square rounded-2xl text-4xl sm:text-5xl flex items-center justify-center transition-all duration-300 transform ${
                        card.isFlipped || card.isMatched
                        ? 'bg-white border-4 border-violet-400 rotate-y-180 shadow-lg'
                        : 'bg-violet-500 border-4 border-violet-600 hover:bg-violet-600 shadow-md'
                    }`}
                >
                    <div className={card.isFlipped || card.isMatched ? 'block animate-pop' : 'hidden'}>
                        {card.content}
                    </div>
                    {!(card.isFlipped || card.isMatched) && (
                        <Star className="text-white/30 w-8 h-8" />
                    )}
                </button>
            ))}
        </div>
      )}
    </div>
  );
};