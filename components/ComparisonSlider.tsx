import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeftRight } from 'lucide-react';

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ beforeImage, afterImage }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState(50); // Percentage 0-100
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    const x = clientX - left;
    const newPos = Math.min(100, Math.max(0, (x / width) * 100));
    setPosition(newPos);
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    handleMove(e.clientX);
  }, [isResizing, handleMove]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!isResizing) return;
    handleMove(e.touches[0].clientX);
  }, [isResizing, handleMove]);

  const onMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [isResizing, onMouseMove, onMouseUp, onTouchMove]);

  return (
    <div className="w-full max-w-2xl mx-auto select-none rounded-xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-100 relative group">
      
      {/* Aspect Ratio Container (Square-ish default) */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-square md:aspect-[4/3] overflow-hidden cursor-ew-resize"
        onMouseDown={() => setIsResizing(true)}
        onTouchStart={() => setIsResizing(true)}
      >
        {/* After Image (Base) */}
        <img 
          src={afterImage} 
          alt="Refurbished" 
          className="absolute top-0 left-0 w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute top-4 right-4 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
          AFTER
        </div>

        {/* Before Image (Overlay) */}
        <div 
          className="absolute top-0 left-0 w-full h-full overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <img 
            src={beforeImage} 
            alt="Original" 
            className="absolute top-0 left-0 w-full h-full object-cover max-w-none" 
            // Important: max-w-none ensures the image doesn't scale within the clipped container
            style={{ width: '100%' }}
            draggable={false}
          />
           <div className="absolute top-4 left-4 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
            BEFORE
          </div>
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg border-2 border-[#aa4dc8]">
            <ArrowLeftRight className="w-4 h-4 text-[#aa4dc8]" />
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-white text-center text-sm text-slate-500">
        Drag slider to compare results
      </div>
    </div>
  );
};
