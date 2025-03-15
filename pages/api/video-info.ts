import type { NextApiRequest, NextApiResponse } from 'next';

type VideoInfo = {
  title: string;
  thumbnail: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VideoInfo>
) {
  const { videoId } = req.query;

  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({ 
      title: '', 
      thumbnail: '', 
      error: 'Video ID is required' 
    });
  }

  try {
    // Use YouTube's oEmbed API to get video information without requiring an API key
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oEmbedUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video info: ${response.statusText}`);
    }
    
    const data = await response.json();
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    
    return res.status(200).json({
      title: data.title || `YouTube Video (${videoId})`,
      thumbnail: thumbnailUrl,
    });
  } catch (error) {
    console.error('Error fetching video info:', error);
    // Fallback to a default title if we can't fetch the real one
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    return res.status(200).json({ 
      title: `YouTube Video (${videoId})`, 
      thumbnail: thumbnailUrl
    });
  }
} 