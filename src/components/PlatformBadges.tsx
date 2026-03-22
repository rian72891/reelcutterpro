import { motion } from 'framer-motion';

const platforms = [
  { name: 'YouTube', color: 'from-red-600 to-red-500' },
  { name: 'TikTok', color: 'from-pink-500 to-cyan-400' },
  { name: 'Instagram', color: 'from-purple-600 to-orange-400' },
  { name: 'Twitter/X', color: 'from-sky-500 to-sky-400' },
];

export function PlatformBadges() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="flex flex-wrap items-center justify-center gap-2 mt-4"
    >
      <span className="text-sm text-muted-foreground mr-1">Suporta:</span>
      {platforms.map((p, i) => (
        <motion.span
          key={p.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 + i * 0.08, duration: 0.3 }}
          className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${p.color} text-foreground`}
        >
          {p.name}
        </motion.span>
      ))}
    </motion.div>
  );
}
