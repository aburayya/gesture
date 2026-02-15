
import React, { useState, useEffect, useCallback } from 'react';
import { GESTURE_WORDS } from './constants';
import { WordConcept, SelectedSlot } from './types';
import { generateNarrative, generateGestureVisual } from './services/geminiService';
import GestureCard from './components/GestureCard';

const SLOT_LABELS = [
  "Starter (Word 1)",
  "Initial State (Word 2)",
  "Outcome (Word 3)",
  "Pre-Result (Word 4)"
];

const App: React.FC = () => {
  const [slots, setSlots] = useState<SelectedSlot[]>([
    { index: 0, word: null },
    { index: 1, word: null },
    { index: 2, word: null },
    { index: 3, word: null },
  ]);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [story, setStory] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingVisuals, setLoadingVisuals] = useState<Record<number, boolean>>({});

  const handleWordSelect = async (word: WordConcept) => {
    const newSlots = [...slots];
    newSlots[activeSlot] = { ...newSlots[activeSlot], word, gestureUrl: undefined };
    setSlots(newSlots);

    // Auto-advance slot
    if (activeSlot < 3) {
      setActiveSlot(activeSlot + 1);
    }

    // Trigger visual generation for this slot
    setLoadingVisuals(prev => ({ ...prev, [activeSlot]: true }));
    const visualUrl = await generateGestureVisual(word.label);
    setSlots(currentSlots => {
      const updated = [...currentSlots];
      updated[activeSlot] = { ...updated[activeSlot], gestureUrl: visualUrl };
      return updated;
    });
    setLoadingVisuals(prev => ({ ...prev, [activeSlot]: false }));
  };

  const handleGenerateStory = async () => {
    if (slots.some(s => !s.word)) return;
    setIsGenerating(true);
    const result = await generateNarrative(slots);
    setStory(result);
    setIsGenerating(false);
  };

  const resetAll = () => {
    setSlots([
      { index: 0, word: null },
      { index: 1, word: null },
      { index: 2, word: null },
      { index: 3, word: null },
    ]);
    setActiveSlot(0);
    setStory("");
  };

  const isComplete = slots.every(s => s.word !== null);

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-4 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gesture Narrator</h1>
          <p className="text-zinc-500 mt-1">Combine abstract hand gestures to generate sequences of existence.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={resetAll}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors"
          >
            Clear All
          </button>
          <button 
            onClick={handleGenerateStory}
            disabled={!isComplete || isGenerating}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
              isComplete && !isGenerating 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isGenerating ? 'Synthesizing Story...' : 'Generate Sequence'}
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left: 84 Word Table */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">The Lexicon of Motion</h2>
            <div className="text-xs text-blue-500 font-mono">Selecting for: {SLOT_LABELS[activeSlot]}</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 h-[600px] overflow-y-auto custom-scrollbar shadow-inner">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GESTURE_WORDS.map((word) => {
                const isSelected = slots.some(s => s.word?.id === word.id);
                return (
                  <button
                    key={word.id}
                    onClick={() => handleWordSelect(word)}
                    className={`px-3 py-2 text-sm text-left rounded-lg transition-all border ${
                      isSelected 
                        ? 'bg-blue-600/20 border-blue-600 text-blue-100' 
                        : 'bg-zinc-800/40 border-zinc-700/50 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <span className="opacity-40 mr-2 font-mono text-[10px]">{String(word.id).padStart(2, '0')}</span>
                    {word.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Visualization & Results */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Gesture Slots */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {slots.map((slot, idx) => (
              <div 
                key={idx} 
                onClick={() => setActiveSlot(idx)}
                className={`cursor-pointer transition-transform ${activeSlot === idx ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}
              >
                <GestureCard 
                  label={slot.word?.label || ""}
                  role={SLOT_LABELS[idx]}
                  imageUrl={slot.gestureUrl}
                  isLoading={loadingVisuals[idx]}
                />
              </div>
            ))}
          </div>

          {/* Result Narrative */}
          <div className="flex-1 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg width="100" height="100" viewBox="0 0 100 100" className="fill-blue-500">
                   <path d="M50 0 L100 50 L50 100 L0 50 Z" />
                </svg>
             </div>
             
             <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Resulting Sequence</h3>
             
             {story ? (
               <div className="text-xl md:text-2xl leading-relaxed text-zinc-100 font-light italic">
                 {story.split(" ").map((word, i) => {
                    const highlight = slots.some(s => s.word?.label.toLowerCase() === word.replace(/[.,]/g, "").toLowerCase());
                    return (
                      <span key={i} className={highlight ? "text-blue-400 font-medium not-italic" : ""}>
                        {word}{" "}
                      </span>
                    )
                 })}
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 space-y-4">
                  <div className="w-12 h-12 border-2 border-zinc-800 border-dashed rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="text-center max-w-xs">Define all four gesture slots to synthesize the story sequence.</p>
               </div>
             )}

             {isGenerating && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-blue-400 font-mono animate-pulse">WEAVING NARRATIVE...</div>
                  </div>
                </div>
             )}
          </div>

        </div>
      </div>

      {/* Footer Info */}
      <footer className="text-center text-zinc-700 text-[10px] tracking-tighter uppercase pb-4">
        Synthesized by Gemini Intelligence • 84 Primary Gestures • Relational Story Engine
      </footer>
    </div>
  );
};

export default App;
