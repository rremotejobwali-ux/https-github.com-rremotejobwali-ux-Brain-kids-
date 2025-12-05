import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Trash2, Download, Palette, X, Square, Circle, Triangle, Brush, Sparkles, Image as ImageIcon, SprayCan } from 'lucide-react';

const COLORS = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', 
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', 
  '#800080', '#A52A2A', '#FFFFFF'
];

const STICKERS = ['⭐', '❤️', '🌟', '🦋', '🌸', '🚗', '🚀', '🐶', '🐱', '🦄', '🌈', '🍦', '🍕', '⚽', '🎸', '🎈', '👑', '💎'];

const BACKGROUNDS = [
  { name: 'Blank', color: '#ffffff' },
  { name: 'Night', color: '#1a1a2e' },
  { name: 'Sky', color: '#87CEEB' },
  { name: 'Paper', color: '#f8f9fa' }
];

type Tool = 'brush' | 'eraser' | 'square' | 'circle' | 'triangle' | 'sticker' | 'spray';

export const PaintingCanvas: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(10);
  const [is3DMode, setIs3DMode] = useState(true);
  const [selectedSticker, setSelectedSticker] = useState('⭐');
  const [bgColor, setBgColor] = useState('#ffffff');
  
  const startPos = useRef<{x: number, y: number} | null>(null);
  const snapshot = useRef<ImageData | null>(null);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  // Handle Resizing
  useEffect(() => {
      const handleResize = () => {
        const canvas = canvasRef.current;
        if(canvas) {
            const ctx = canvas.getContext('2d');
            if(ctx) {
                const imageData = ctx.getImageData(0,0, canvas.width, canvas.height);
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
                ctx.putImageData(imageData, 0, 0);
            }
        }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getCoords(e);
    startPos.current = { x, y };

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
        snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        if (tool === 'sticker') {
            ctx.font = `${lineWidth * 5}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = is3DMode ? 'rgba(0,0,0,0.3)' : 'transparent';
            ctx.shadowBlur = is3DMode ? 10 : 0;
            ctx.fillText(selectedSticker, x, y);
            setIsDrawing(false);
        }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !startPos.current) return;

    const { x, y } = getCoords(e);

    // Shape/Preview Logic
    if (['square', 'circle', 'triangle'].includes(tool)) {
        if (snapshot.current) ctx.putImageData(snapshot.current, 0, 0);
    }

    // 3D Shadow Configuration
    if (is3DMode && tool !== 'eraser' && tool !== 'spray') {
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = lineWidth / 2;
        ctx.shadowOffsetX = lineWidth / 4;
        ctx.shadowOffsetY = lineWidth / 4;
    } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    ctx.lineWidth = tool === 'eraser' ? lineWidth * 2 : lineWidth;
    ctx.strokeStyle = tool === 'eraser' ? bgColor : color;
    ctx.fillStyle = color;

    if (tool === 'brush' || tool === 'eraser') {
        ctx.lineTo(x, y);
        ctx.stroke();
    } else if (tool === 'spray') {
        ctx.fillStyle = color;
        for (let i = 0; i < lineWidth * 2; i++) {
            const offsetX = (Math.random() - 0.5) * lineWidth * 2;
            const offsetY = (Math.random() - 0.5) * lineWidth * 2;
            if (offsetX*offsetX + offsetY*offsetY <= lineWidth*lineWidth) {
                ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
            }
        }
    } else if (tool === 'square') {
        const w = x - startPos.current.x;
        const h = y - startPos.current.y;
        ctx.fillRect(startPos.current.x, startPos.current.y, w, h);
        ctx.strokeRect(startPos.current.x, startPos.current.y, w, h);
    } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.current.x, 2) + Math.pow(y - startPos.current.y, 2));
        ctx.beginPath();
        ctx.arc(startPos.current.x, startPos.current.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    } else if (tool === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(startPos.current.x, startPos.current.y);
        ctx.lineTo(x, y);
        ctx.lineTo(startPos.current.x - (x - startPos.current.x), y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
    snapshot.current = null;
  };

  const changeBackground = (newColor: string) => {
    setBgColor(newColor);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      // Warning: this clears canvas. In a real app we'd use layers.
      // For simple kids app, we clear.
      if (confirm("Changing background will clear your drawing. OK?")) {
        ctx.fillStyle = newColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas) {
        const link = document.createElement('a');
        link.download = 'rafia-rukshar-art.png';
        link.href = canvas.toDataURL();
        link.click();
    }
  };

  return (
    <div className="w-full h-screen fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center font-fredoka p-4">
       <div className="w-full h-full max-w-7xl bg-[#f0f4f8] rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative border-8 border-white">
           
           {/* Top Bar */}
           <div className="bg-white p-4 flex justify-between items-center shadow-lg z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-pink-500 to-violet-500 p-3 rounded-2xl text-white shadow-lg animate-bounce-slow">
                        <Palette size={24}/> 
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-wide">Painting Studio</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase">Rafia Rukshar Presents</p>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button onClick={() => setIs3DMode(!is3DMode)} className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${is3DMode ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-200' : 'bg-slate-200 text-slate-500'}`}>
                        <Sparkles size={18}/> {is3DMode ? '3D ON' : '3D OFF'}
                    </button>
                    <button onClick={onExit} className="bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-red-200 hover:bg-red-600">
                        <X size={20}/> Close
                    </button>
                </div>
           </div>

           {/* Workspace */}
           <div className="flex-1 flex gap-4 p-4 overflow-hidden bg-slate-100">
                
                {/* Colors (Left) */}
                <div className="bg-white rounded-[2rem] p-3 flex flex-col items-center gap-3 shadow-lg overflow-y-auto w-20">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => { setColor(c); if(tool==='eraser') setTool('brush'); }}
                            className={`w-12 h-12 rounded-full border-4 shadow-sm transition-transform ${color === c && tool !== 'eraser' ? 'scale-110 border-slate-800' : 'border-white'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                    <div className="h-0.5 w-full bg-slate-200 my-2"></div>
                    <button onClick={() => setTool('eraser')} className={`p-3 rounded-2xl transition-all ${tool === 'eraser' ? 'bg-pink-100 text-pink-500 shadow-inner' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <Eraser size={24} />
                    </button>
                </div>

                {/* Canvas (Center) */}
                <div className="flex-1 relative rounded-[2rem] overflow-hidden shadow-inner bg-white">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full cursor-crosshair touch-none"
                        onMouseDown={startDrawing}
                        onMouseUp={stopDrawing}
                        onMouseMove={draw}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchEnd={stopDrawing}
                        onTouchMove={draw}
                    />
                </div>

                {/* Tools (Right) */}
                <div className="bg-white rounded-[2rem] p-3 flex flex-col items-center gap-4 shadow-lg w-24 overflow-y-auto">
                    {/* Brushes */}
                    <div className="flex flex-col gap-2 w-full">
                        <button onClick={() => setTool('brush')} className={`p-3 rounded-xl flex flex-col items-center gap-1 ${tool === 'brush' ? 'bg-blue-100 text-blue-600' : 'text-slate-400'}`}>
                            <Brush size={24} /> <span className="text-[10px] font-bold">Brush</span>
                        </button>
                        <button onClick={() => setTool('spray')} className={`p-3 rounded-xl flex flex-col items-center gap-1 ${tool === 'spray' ? 'bg-purple-100 text-purple-600' : 'text-slate-400'}`}>
                            <SprayCan size={24} /> <span className="text-[10px] font-bold">Spray</span>
                        </button>
                    </div>

                    <div className="h-0.5 w-full bg-slate-200"></div>

                    {/* Shapes */}
                    <div className="grid grid-cols-2 gap-2 w-full">
                         <button onClick={() => setTool('square')} className={`p-2 rounded-lg ${tool === 'square' ? 'bg-green-100 text-green-600' : 'text-slate-400'}`}><Square size={20}/></button>
                         <button onClick={() => setTool('circle')} className={`p-2 rounded-lg ${tool === 'circle' ? 'bg-orange-100 text-orange-600' : 'text-slate-400'}`}><Circle size={20}/></button>
                         <button onClick={() => setTool('triangle')} className={`p-2 rounded-lg col-span-2 ${tool === 'triangle' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}><Triangle size={20}/></button>
                    </div>

                    <div className="h-0.5 w-full bg-slate-200"></div>

                    {/* Backgrounds */}
                    <div className="flex flex-col gap-1 w-full">
                        <span className="text-[10px] font-bold text-slate-400 text-center">Paper</span>
                        <div className="grid grid-cols-2 gap-1">
                            {BACKGROUNDS.map(bg => (
                                <button 
                                    key={bg.name} 
                                    onClick={() => changeBackground(bg.color)}
                                    className="w-full aspect-square rounded-md border border-slate-200"
                                    style={{ backgroundColor: bg.color }}
                                    title={bg.name}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="h-0.5 w-full bg-slate-200"></div>

                    {/* Stickers */}
                    <div className="relative group w-full">
                        <button onClick={() => setTool('sticker')} className={`w-full p-2 rounded-xl flex flex-col items-center gap-1 ${tool === 'sticker' ? 'bg-yellow-100 border-2 border-yellow-300' : 'bg-slate-50'}`}>
                            <span className="text-2xl">{selectedSticker}</span>
                            <span className="text-[10px] font-bold">Sticker</span>
                        </button>
                        {/* Popover */}
                        <div className="absolute right-full top-0 mr-4 bg-white p-4 rounded-2xl shadow-2xl grid grid-cols-4 gap-2 w-64 hidden group-hover:grid z-20 border-4 border-slate-100">
                            {STICKERS.map(s => (
                                <button key={s} onClick={() => { setSelectedSticker(s); setTool('sticker'); }} className="text-3xl p-2 hover:bg-slate-100 rounded-xl transition-transform hover:scale-125">{s}</button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto w-full flex flex-col gap-2">
                         <button onClick={clearCanvas} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200"><Trash2 size={20} /></button>
                         <button onClick={downloadDrawing} className="p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 shadow-lg shadow-indigo-200"><Download size={20} /></button>
                    </div>
                </div>
           </div>

           {/* Size Slider Overlay */}
           <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-8 py-3 rounded-full shadow-xl border border-white flex items-center gap-4">
                <span className="font-bold text-slate-400 text-sm uppercase">Brush Size</span>
                <input 
                    type="range" 
                    min="5" 
                    max="60" 
                    value={lineWidth} 
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                    className="w-48 accent-pink-500 h-2 rounded-full bg-slate-200 appearance-none"
                />
                <div className="w-8 h-8 rounded-full bg-slate-800" style={{ width: lineWidth/1.5, height: lineWidth/1.5 }}></div>
           </div>
       </div>
    </div>
  );
};