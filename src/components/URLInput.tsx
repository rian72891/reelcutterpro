import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, ArrowRight, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function URLInput() {
  const { videoUrl, setVideoUrl, setStep, setIsProcessing, setProgress, setCurrentVideo, setSmartCuts, addRecentVideo } = useAppStore();
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const detectPlatform = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    return null;
  };

  const handleSubmit = async () => {
    const platform = detectPlatform(videoUrl);
    if (!platform) return;

    setLoading(true);
    setIsProcessing(true);
    setStep('analyzing');

    // Simulate analysis
    for (let i = 0; i <= 100; i += 2) {
      await new Promise((r) => setTimeout(r, 40));
      setProgress(i);
    }

    const video = {
      id: Date.now().toString(),
      url: videoUrl,
      title: 'Vídeo importado — ' + platform,
      author: '@creator',
      duration: 480,
      platform: platform as any,
      thumbnail: '',
      processedAt: new Date().toISOString(),
    };

    setCurrentVideo(video);
    addRecentVideo(video);

    setSmartCuts([
      { id: '1', startTime: 12, endTime: 42, score: 92, transcript: 'Esse é o momento mais importante do vídeo, onde o ponto principal é apresentado.', thumbnail: '', selected: true },
      { id: '2', startTime: 78, endTime: 108, score: 85, transcript: 'Uma revelação surpreendente que gera muito engajamento.', thumbnail: '', selected: false },
      { id: '3', startTime: 145, endTime: 175, score: 71, transcript: 'Dica prática que o público pode aplicar imediatamente.', thumbnail: '', selected: false },
      { id: '4', startTime: 230, endTime: 260, score: 58, transcript: 'Momento engraçado que pode viralizar.', thumbnail: '', selected: false },
    ]);

    setLoading(false);
    setIsProcessing(false);
    setProgress(0);
    setStep('selecting');
  };

  const isValid = detectPlatform(videoUrl) !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        className={`relative flex items-center rounded-2xl transition-all duration-300 glass ${
          isFocused ? 'neon-shadow border-primary/40' : ''
        }`}
      >
        <Link2 className="absolute left-4 w-5 h-5 text-muted-foreground" />
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Cole um link do YouTube, TikTok ou Instagram"
          className="flex-1 bg-transparent pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
        />
        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="m-1.5 px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Analisar
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
      {videoUrl && !isValid && (
        <p className="text-destructive text-sm mt-2 pl-2">
          URL não reconhecida. Suportamos YouTube, TikTok, Instagram e Twitter/X.
        </p>
      )}
    </motion.div>
  );
}
