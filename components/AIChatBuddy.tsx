
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { getChatResponse } from '../services/geminiService';
import { Send, Bot, User, Volume2, StopCircle, ArrowLeft, Mic, MicOff } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export const AIChatBuddy: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "Hello! I am Robo. I can speak English! Say 'Hi' to me!", sender: 'bot' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            // Optional: Auto-send after speaking
            // handleSend(transcript); 
        };
    }
  }, []);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 1;
    u.pitch = 1.2; // Robot-ish pitch
    
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(u);
  };

  const handleMicClick = () => {
    if (isListening) {
        recognitionRef.current?.stop();
    } else {
        recognitionRef.current?.start();
    }
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;
    
    const userMsg: Message = { id: Date.now(), text: textToSend, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Call AI
    const reply = await getChatResponse(textToSend, 1); // Defaulting to grade 1 for simple language, or pass prop
    
    setIsLoading(false);
    const botMsg: Message = { id: Date.now() + 1, text: reply, sender: 'bot' };
    setMessages(prev => [...prev, botMsg]);
    
    // Auto speak
    speak(reply);
  };

  return (
    <div className="w-full max-w-2xl mx-auto h-[80vh] flex flex-col bg-white rounded-[2.5rem] shadow-2xl border-8 border-slate-100 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-cyan-500 p-4 flex justify-between items-center shadow-lg z-10">
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-cyan-300 shadow-md transition-transform ${isSpeaking ? 'animate-bounce' : ''}`}>
                    <Bot size={28} className="text-cyan-600" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-white">Talk to Robo</h2>
                    <p className="text-cyan-100 text-xs font-bold uppercase">{isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Online'}</p>
                </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => { window.speechSynthesis.cancel(); onExit(); }} className="bg-cyan-600 border-none text-white hover:bg-cyan-700 rounded-full">
                <ArrowLeft size={18} className="mr-1"/> Exit
            </Button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-lg font-bold shadow-sm ${
                        msg.sender === 'user' 
                        ? 'bg-pink-500 text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 rounded-tl-none border-2 border-slate-200'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border-2 border-slate-200 shadow-sm flex gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t-2 border-slate-100 flex gap-2 items-center">
            <button
                onClick={handleMicClick}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening..." : "Type or speak..."}
                className="flex-1 bg-slate-100 border-2 border-slate-200 rounded-full px-6 py-4 text-lg font-bold text-slate-700 outline-none focus:border-cyan-400 focus:bg-cyan-50 transition-all placeholder-slate-400"
            />
            
            <Button 
                onClick={() => handleSend()} 
                disabled={!input.trim() || isLoading}
                className="w-14 h-14 rounded-full flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 shadow-cyan-200"
            >
                <Send size={24} className="ml-1" />
            </Button>
        </div>
    </div>
  );
};
