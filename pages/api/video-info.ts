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
    // This is a simple implementation. In a production app, you might want to use the YouTube Data API
    // But that requires an API key and quota management
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    // For now, we'll just return the thumbnail URL
    // In a real app with a YouTube API key, you could fetch the actual title
    return res.status(200).json({
      title: 'YouTube Video',
      thumbnail: thumbnailUrl,
    });
  } catch (error) {
    console.error('Error fetching video info:', error);
    return res.status(500).json({ 
      title: '', 
      thumbnail: '', 
      error: 'Failed to fetch video information' 
    });
  }
} 