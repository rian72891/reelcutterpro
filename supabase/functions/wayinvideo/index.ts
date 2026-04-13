const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WAYIN_BASE = 'https://wayinvideo-api.wayin.ai/api/v2';

/** Map seconds to WayinVideo duration enum */
function mapDuration(seconds: number): string {
  if (seconds <= 30) return 'DURATION_0_30';
  if (seconds <= 60) return 'DURATION_30_60';
  if (seconds <= 90) return 'DURATION_60_90';
  if (seconds <= 180) return 'DURATION_90_180';
  return 'DURATION_180_300';
}

function getApiKey(): string {
  const key = Deno.env.get('WAYINVIDEO_API_KEY');
  if (!key) throw new Error('WAYINVIDEO_API_KEY not configured');
  return key;
}

function wayinHeaders(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'x-wayinvideo-api-version': 'v2',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = getApiKey();
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // POST /wayinvideo?action=clip — Submit AI clipping task
    if (req.method === 'POST' && action === 'clip') {
      const body = await req.json();
      const { video_url, clip_count, target_duration, language } = body;
      if (!video_url) {
        return new Response(JSON.stringify({ error: 'video_url is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const res = await fetch(`${WAYIN_BASE}/clips`, {
        method: 'POST',
        headers: wayinHeaders(apiKey),
        body: JSON.stringify({
          video_url,
          clip_count: clip_count || 5,
          target_duration: mapDuration(target_duration || 30),
          language: language || 'pt',
          enable_export: false,
        }),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /wayinvideo?action=clip-results&id=xxx — Poll clipping results
    if (req.method === 'GET' && action === 'clip-results') {
      const id = url.searchParams.get('id');
      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const res = await fetch(`${WAYIN_BASE}/clips/results/${id}`, {
        headers: wayinHeaders(apiKey),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /wayinvideo?action=export — Submit export task
    if (req.method === 'POST' && action === 'export') {
      const body = await req.json();
      const { project_id, clip_indices, resolution, enable_caption, caption_style, aspect_ratio } = body;
      if (!project_id) {
        return new Response(JSON.stringify({ error: 'project_id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const res = await fetch(`${WAYIN_BASE}/clips/export`, {
        method: 'POST',
        headers: wayinHeaders(apiKey),
        body: JSON.stringify({
          project_id,
          clip_indices: clip_indices || [0],
          resolution: resolution || 'FHD_1080P',
          enable_caption: enable_caption ?? true,
          caption_style: caption_style || 'style_1',
          aspect_ratio: aspect_ratio || 'PORTRAIT_9_16',
        }),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /wayinvideo?action=export-results&id=xxx — Poll export results
    if (req.method === 'GET' && action === 'export-results') {
      const id = url.searchParams.get('id');
      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const res = await fetch(`${WAYIN_BASE}/clips/export/${id}`, {
        headers: wayinHeaders(apiKey),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /wayinvideo?action=find-moments — Submit find moments task
    if (req.method === 'POST' && action === 'find-moments') {
      const body = await req.json();
      const { video_url, prompt, target_duration, language } = body;
      if (!video_url) {
        return new Response(JSON.stringify({ error: 'video_url is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const res = await fetch(`${WAYIN_BASE}/clips/find-moments`, {
        method: 'POST',
        headers: wayinHeaders(apiKey),
        body: JSON.stringify({
          video_url,
          prompt: prompt || 'viral moments, engaging highlights',
          target_duration: target_duration || 30,
          language: language || 'pt',
          enable_export: false,
        }),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /wayinvideo?action=find-moments-results&id=xxx
    if (req.method === 'GET' && action === 'find-moments-results') {
      const id = url.searchParams.get('id');
      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const res = await fetch(`${WAYIN_BASE}/clips/find-moments/results/${id}`, {
        headers: wayinHeaders(apiKey),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action. Use: clip, clip-results, export, export-results, find-moments, find-moments-results' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('WayinVideo Edge Function error:', error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
