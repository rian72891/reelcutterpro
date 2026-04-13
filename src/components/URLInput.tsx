import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { validateVideoUrl } from '@/lib/videoApi';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';

export function URLInput() {
  const { videoUrl, setVideoUrl } = useAppStore();
  const { analyzeVideo, processingStatus } = useVideoProcessing();
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validation = validateVideoUrl(videoUrl);

  const handleSubmit = async () => {
    if (!validation.valid) return;
    setError(null);
    setLoading(true);

    try {
      await analyzeVideo(videoUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido ao analisar vídeo';
      setError(message);
    } finally {
      setLoading(false);
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
          onKeyDown={(e) => e.key === 'Enter' && validation.valid && !loading && handleSubmit()}
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

      {/* Processing status */}
      {loading && processingStatus && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground mt-3 text-center flex items-center justify-center gap-2"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          {processingStatus}
        </motion.p>
      )}

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
