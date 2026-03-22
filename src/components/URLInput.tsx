import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { fetchVideoMetadata, validateVideoUrl } from '@/lib/videoApi';

export function URLInput() {
  const { videoUrl, setVideoUrl, setStep, setIsProcessing, setProgress, setCurrentVideo, setSmartCuts, addRecentVideo } = useAppStore();
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validation = validateVideoUrl(videoUrl);

  const handleSubmit = async () => {
    if (!validation.valid) return;

    setError(null);
    setLoading(true);
    setIsProcessing(true);
    setStep('analyzing');
    setProgress(10);

    try {
      // Real API call to fetch metadata
      setProgress(30);
      const metadata = await fetchVideoMetadata(videoUrl);
      setProgress(60);

      const video = {
        id: Date.now().toString(),
        url: videoUrl,
        title: metadata.title,
        author: metadata.author,
        duration: metadata.duration || 480,
        platform: metadata.platform,
        thumbnail: metadata.thumbnail,
        processedAt: new Date().toISOString(),
      };

      setCurrentVideo(video);
      addRecentVideo(video);
      setProgress(80);

      // Generate smart cut suggestions based on video duration
      const dur = video.duration || 480;
      const cuts = generateSmartCuts(dur);
      setSmartCuts(cuts);

      setProgress(100);
      await new Promise((r) => setTimeout(r, 300));

      setStep('selecting');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido ao analisar vídeo';
      setError(message);
      setStep('idle');
    } finally {
      setLoading(false);
      setIsProcessing(false);
      setProgress(0);
    }
  };

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
          onChange={(e) => { setVideoUrl(e.target.value); setError(null); }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => e.key === 'Enter' && validation.valid && handleSubmit()}
          placeholder="Cole um link do YouTube, TikTok ou Instagram"
          className="flex-1 bg-transparent pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
        />
        <button
          onClick={handleSubmit}
          disabled={!validation.valid || loading}
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

      {videoUrl && !validation.valid && validation.error && (
        <p className="text-destructive text-sm mt-2 pl-2">
          {validation.error}
        </p>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-destructive font-medium">{error}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Verifique se o vídeo é público e a URL está correta.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function generateSmartCuts(videoDuration: number) {
  const segments = Math.min(4, Math.max(2, Math.floor(videoDuration / 60)));
  const cuts = [];
  for (let i = 0; i < segments; i++) {
    const start = Math.floor((videoDuration / segments) * i) + Math.floor(Math.random() * 15);
    const duration = 25 + Math.floor(Math.random() * 10);
    const end = Math.min(start + duration, videoDuration);
    cuts.push({
      id: (i + 1).toString(),
      startTime: start,
      endTime: end,
      score: Math.floor(95 - i * 12 - Math.random() * 8),
      transcript: [
        'Esse é o momento mais importante do vídeo, onde o ponto principal é apresentado.',
        'Uma revelação surpreendente que gera muito engajamento.',
        'Dica prática que o público pode aplicar imediatamente.',
        'Momento que pode viralizar nas redes sociais.',
      ][i] || 'Trecho relevante do vídeo.',
      thumbnail: '',
      selected: i === 0,
    });
  }
  return cuts;
}
