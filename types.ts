
export enum Subject {
  MATH = 'Mathematics',
  ENGLISH = 'English Grammar',
  COMPUTER = 'Computer Science',
  AI = 'AI Technology',
  SCIENCE = 'General Science',
  GEOGRAPHY = 'Geography',
  HISTORY = 'History',
  POEMS = 'Poems & Rhymes'
}

export enum GameType {
  QUIZ = 'Quiz Challenge',
  TYPING = 'Typing Mastery',
  READING = 'Read & Learn', // For Poems
  ARCADE = 'Arcade Games'   // For the Games Box
}

export interface User {
  username: string;
  grade: number;
  xp: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string; 
  explanation: string;
}

export interface TypingChallenge {
  text: string;
  topic: string;
  difficulty: string;
}

export interface Poem {
  title: string;
  content: string; // The poem text with newlines
  theme: string;
}

export interface Lesson {
  title: string;
  content: string;
  funFact: string;
  keyWords: string[];
}

export interface GameResult {
  score: number;
  accuracy?: number; 
  wpm?: number;
}