import { create } from 'zustand';

export type ProcessingStep = 'idle' | 'analyzing' | 'selecting' | 'editing';
export type CutMode = 'manual' | 'auto';

export interface VideoMeta {
  id: string;
  url: string;
  title: string;
  author: string;
  duration: number;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'twitter';
  thumbnail: string;
  processedAt: string;
}

export interface SmartCut {
  id: string;
  startTime: number;
  endTime: number;
  score: number;
  transcript: string;
  thumbnail: string;
  selected: boolean;
}

export interface CaptionStyle {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  fontSize: number;
  outline: boolean;
}

interface AppState {
  currentStep: ProcessingStep;
  setStep: (step: ProcessingStep) => void;
  videoUrl: string;
  setVideoUrl: (url: string) => void;
  currentVideo: VideoMeta | null;
  setCurrentVideo: (video: VideoMeta | null) => void;
  cutMode: CutMode;
  setCutMode: (mode: CutMode) => void;
  manualRange: [number, number];
  setManualRange: (range: [number, number]) => void;
  smartCuts: SmartCut[];
  setSmartCuts: (cuts: SmartCut[]) => void;
  toggleCutSelection: (id: string) => void;
  selectedDuration: number;
  setSelectedDuration: (d: number) => void;
  selectedFormat: string;
  setSelectedFormat: (f: string) => void;
  selectedQuality: string;
  setSelectedQuality: (q: string) => void;
  captionStyle: string;
  setCaptionStyle: (s: string) => void;
  recentVideos: VideoMeta[];
  addRecentVideo: (v: VideoMeta) => void;
  isProcessing: boolean;
  setIsProcessing: (p: boolean) => void;
  progress: number;
  setProgress: (p: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentStep: 'idle',
  setStep: (step) => set({ currentStep: step }),
  videoUrl: '',
  setVideoUrl: (url) => set({ videoUrl: url }),
  currentVideo: null,
  setCurrentVideo: (video) => set({ currentVideo: video }),
  cutMode: 'auto',
  setCutMode: (mode) => set({ cutMode: mode }),
  manualRange: [0, 30],
  setManualRange: (range) => set({ manualRange: range }),
  smartCuts: [],
  setSmartCuts: (cuts) => set({ smartCuts: cuts }),
  toggleCutSelection: (id) =>
    set((state) => ({
      smartCuts: state.smartCuts.map((c) =>
        c.id === id ? { ...c, selected: !c.selected } : c
      ),
    })),
  selectedDuration: 30,
  setSelectedDuration: (d) => set({ selectedDuration: d }),
  selectedFormat: '9:16',
  setSelectedFormat: (f) => set({ selectedFormat: f }),
  selectedQuality: '1080p',
  setSelectedQuality: (q) => set({ selectedQuality: q }),
  captionStyle: 'tiktok',
  setCaptionStyle: (s) => set({ captionStyle: s }),
  recentVideos: [
    {
      id: '1',
      url: 'https://youtube.com/watch?v=example1',
      title: 'Como fazer pão caseiro perfeito',
      author: 'Chef Maria',
      duration: 847,
      platform: 'youtube',
      thumbnail: '',
      processedAt: '2026-03-21T14:30:00Z',
    },
    {
      id: '2',
      url: 'https://tiktok.com/@user/video/123',
      title: 'Treino HIIT 20 minutos',
      author: '@fitcoach_br',
      duration: 1203,
      platform: 'tiktok',
      thumbnail: '',
      processedAt: '2026-03-20T09:15:00Z',
    },
    {
      id: '3',
      url: 'https://instagram.com/reel/abc',
      title: 'Dicas de fotografia noturna',
      author: '@fotopro',
      duration: 562,
      platform: 'instagram',
      thumbnail: '',
      processedAt: '2026-03-19T18:45:00Z',
    },
    {
      id: '4',
      url: 'https://x.com/user/status/456',
      title: 'Entrevista sobre IA no Brasil',
      author: '@techtalks',
      duration: 1800,
      platform: 'twitter',
      thumbnail: '',
      processedAt: '2026-03-18T11:00:00Z',
    },
  ],
  addRecentVideo: (v) =>
    set((state) => ({
      recentVideos: [v, ...state.recentVideos].slice(0, 6),
    })),
  isProcessing: false,
  setIsProcessing: (p) => set({ isProcessing: p }),
  progress: 0,
  setProgress: (p) => set({ progress: p }),
}));
