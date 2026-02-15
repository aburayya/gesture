
export interface WordConcept {
  id: number;
  label: string;
  category: 'action' | 'state' | 'result' | 'pre-result';
}

export interface SelectedSlot {
  index: number; // 0: Word-1 (Starter), 1: Word-2 (Initial State), 2: Word-3 (Outcome), 3: Word-4 (Pre-result)
  word: WordConcept | null;
  gestureUrl?: string;
  gestureDescription?: string;
}

export interface GeneratedStory {
  narrative: string;
  elements: string[];
}
