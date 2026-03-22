import { motion } from 'framer-motion';
import { Play, Clock, Youtube, Instagram, Twitter } from 'lucide-react';
import { useAppStore, VideoMeta } from '@/store/useAppStore';

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  youtube: Youtube,
  tiktok: Play,
  instagram: Instagram,
  twitter: Twitter,
};

const platformColors: Record<string, string> = {
  youtube: 'text-red-500',
  tiktok: 'text-pink-400',
  instagram: 'text-purple-400',
  twitter: 'text-sky-400',
};

function formatDuration(s: number) {
  if (!s) return '—';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function VideoCard({ video, index }: { video: VideoMeta; index: number }) {
  const Icon = platformIcons[video.platform] || Play;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-2xl p-4 glass-hover transition-all duration-300 cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="w-full aspect-video rounded-xl bg-muted mb-3 flex items-center justify-center relative overflow-hidden">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
        )}
        <Play className="w-8 h-8 text-white/80 drop-shadow-lg group-hover:scale-110 transition-transform duration-200 z-10" />
      </div>
      <h4 className="text-sm font-semibold truncate mb-1">{video.title}</h4>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={`w-3.5 h-3.5 ${platformColors[video.platform]}`} />
        <span className="truncate">{video.author}</span>
        <span className="ml-auto flex items-center gap-1 flex-shrink-0">
          <Clock className="w-3 h-3" />
          {formatDuration(video.duration)}
        </span>
      </div>
    </motion.div>
  );
}

export function RecentVideos() {
  const { recentVideos } = useAppStore();

  if (recentVideos.length === 0) return null;

  return (
    <section className="mt-16">
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-lg font-semibold mb-6 text-muted-foreground"
      >
        Recentes
      </motion.h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentVideos.slice(0, 6).map((v, i) => (
          <VideoCard key={v.id} video={v} index={i} />
        ))}
      </div>
    </section>
  );
}
