/**
 * Free video metadata APIs — no API keys needed.
 * Uses noembed.com (oEmbed aggregator) + URL pattern extraction.
 */

export interface VideoMetadata {
  title: string;
  author: string;
  duration: number;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'twitter';
  thumbnail: string;
  embedUrl: string | null;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function detectPlatform(url: string): VideoMetadata['platform'] | null {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  return null;
}

/**
 * Fetch metadata via noembed.com (free, no auth, CORS-friendly).
 */
async function fetchOEmbed(url: string): Promise<{
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
  html?: string;
} | null> {
  try {
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * For YouTube, also try the free noembed + thumbnail CDN.
 */
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export async function fetchVideoMetadata(url: string): Promise<VideoMetadata> {
  const platform = detectPlatform(url);
  if (!platform) throw new Error('Plataforma não suportada');

  // Try oEmbed first
  const oembed = await fetchOEmbed(url);

  const base: VideoMetadata = {
    title: oembed?.title || `Vídeo de ${platform}`,
    author: oembed?.author_name || '@creator',
    duration: 0,
    platform,
    thumbnail: oembed?.thumbnail_url || '',
    embedUrl: null,
  };

  // Platform-specific enrichment
  if (platform === 'youtube') {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      base.thumbnail = base.thumbnail || getYouTubeThumbnail(videoId);
      base.embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    // Try to get duration from YouTube's free returnYouTubeDislike API (no key)
    if (videoId) {
      try {
        const durationRes = await fetch(
          `https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`
        );
        if (durationRes.ok) {
          // This API doesn't return duration, but confirms the video exists
          // Duration will be estimated or set to 0
        }
      } catch {
        // Silent fail
      }
    }
  }

  // Estimate duration if not available (will be 0 — user sees "duração desconhecida")
  return base;
}

/**
 * Validate that a URL is a supported video URL.
 */
export function validateVideoUrl(url: string): {
  valid: boolean;
  platform: VideoMetadata['platform'] | null;
  error?: string;
} {
  if (!url.trim()) return { valid: false, platform: null };

  try {
    new URL(url);
  } catch {
    return { valid: false, platform: null, error: 'URL inválida' };
  }

  const platform = detectPlatform(url);
  if (!platform) {
    return {
      valid: false,
      platform: null,
      error: 'Plataforma não suportada. Use YouTube, TikTok, Instagram ou Twitter/X.',
    };
  }

  return { valid: true, platform };
}
