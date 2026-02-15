
import React from 'react';

interface GestureCardProps {
  label: string;
  role: string;
  imageUrl?: string;
  isLoading: boolean;
}

const GestureCard: React.FC<GestureCardProps> = ({ label, role, imageUrl, isLoading }) => {
  return (
    <div className="flex flex-col items-center bg-zinc-900 rounded-xl p-4 border border-zinc-800 shadow-lg transition-all hover:border-blue-500/50">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">{role}</div>
      <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden flex items-center justify-center border border-zinc-800">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] text-zinc-600 animate-pulse">GENERATING GESTURE...</span>
          </div>
        ) : imageUrl ? (
          <img 
            src={imageUrl} 
            alt={label} 
            className="w-full h-full object-cover animate-in fade-in duration-700"
          />
        ) : (
          <div className="text-zinc-700 text-xs text-center px-4">Select a word to visualize gesture</div>
        )}
      </div>
      <div className="mt-4 text-lg font-medium text-blue-400">{label || '—'}</div>
    </div>
  );
};

export default GestureCard;
