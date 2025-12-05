
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

export const BackgroundMusic: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const schedulerTimerRef = useRef<number | null>(null);
  const noteIndexRef = useRef<number>(0);

  // A simple cheerful melody (C Major scale pattern)
  const MELODY = [
    { freq: 261.63, dur: 0.5 }, // C4
    { freq: 329.63, dur: 0.5 }, // E4
    { freq: 392.00, dur: 0.5 }, // G4
    { freq: 523.25, dur: 1.0 }, // C5
    { freq: 392.00, dur: 0.5 }, // G4
    { freq: 329.63, dur: 0.5 }, // E4
    { freq: 261.63, dur: 1.0 }, // C4
    { freq: 293.66, dur: 0.5 }, // D4
    { freq: 349.23, dur: 0.5 }, // F4
    { freq: 392.00, dur: 0.5 }, // G4
    { freq: 293.66, dur: 0.5 }, // D4
    { freq: 261.63, dur: 2.0 }, // C4 (Rest/Long)
  ];

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  };

  const startMusic = () => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }

    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    setIsPlaying(true);
    nextNoteTimeRef.current = audioCtxRef.current!.currentTime + 0.1;
    noteIndexRef.current = 0;
    scheduler();
  };

  const stopMusic = () => {
    setIsPlaying(false);
    if (schedulerTimerRef.current) window.clearTimeout(schedulerTimerRef.current);
    if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
    }
  };

  const playNote = (freq: number, duration: number, time: number) => {
    if (!audioCtxRef.current) return;
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();

    osc.type = 'sine'; // Smooth sound
    osc.frequency.value = freq;

    // Envelope for a gentle bell/chime sound
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.05, time + 0.05); // Attack (Low volume)
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration); // Decay

    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);

    osc.start(time);
    osc.stop(time + duration);
  };

  const scheduler = () => {
    if (!audioCtxRef.current) return;

    // Schedule notes ahead
    while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + 0.1) {
        const note = MELODY[noteIndexRef.current % MELODY.length];
        playNote(note.freq, note.dur, nextNoteTimeRef.current);
        nextNoteTimeRef.current += note.dur;
        noteIndexRef.current++;
    }
    
    if (isPlaying) {
        schedulerTimerRef.current = window.setTimeout(scheduler, 25);
    }
  };

  useEffect(() => {
    return () => stopMusic();
  }, []);

  return (
    <button 
        onClick={toggleMusic}
        className={`fixed bottom-4 right-4 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 border-4 border-white ${isPlaying ? 'bg-pink-500 animate-bounce-slow' : 'bg-slate-400'}`}
    >
        {isPlaying ? <Volume2 className="text-white w-6 h-6" /> : <VolumeX className="text-white w-6 h-6" />}
        <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
            {isPlaying ? 'ON' : 'OFF'}
        </span>
    </button>
  );
};
